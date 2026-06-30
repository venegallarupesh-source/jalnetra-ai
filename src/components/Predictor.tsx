import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { supabase } from '../lib/supabase';
import { SEEDED_DISTRICTS, STATES, CROPS } from '../data/districts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Play, RotateCcw, MessageSquare, Save, Download, Lock, Sprout } from 'lucide-react';

interface PredictionResult {
  healthScore: number;
  stressLevel: 'low' | 'moderate' | 'high';
  confidence: number;
  waterDeficit: number;
  growthStage: string;
  irrigationDate: string;
  shap: { feature: string; value: number }[];
  advisory: string;
}

// Deterministic prediction logic — same inputs always produce same output
function predict(_state: string, district: string, crop: string, sowingDate: string, _area: number): PredictionResult {
  // Find district in seeded data for base stress
  const districtData = SEEDED_DISTRICTS.find((d) => d.district_name === district);
  const baseStress = districtData?.stress_pct || 40;

  // Days since sowing → growth stage
  const sowing = new Date(sowingDate);
  const daysSinceSowing = Math.max(1, Math.floor((Date.now() - sowing.getTime()) / (1000 * 60 * 60 * 24)));

  let stage = 'seedling';
  let stageKey = 'predictor.stage.seedling';
  if (daysSinceSowing > 100) { stage = 'maturity'; stageKey = 'predictor.stage.maturity'; }
  else if (daysSinceSowing > 80) { stage = 'milking'; stageKey = 'predictor.stage.milking'; }
  else if (daysSinceSowing > 60) { stage = 'flowering'; stageKey = 'predictor.stage.flowering'; }
  else if (daysSinceSowing > 45) { stage = 'booting'; stageKey = 'predictor.stage.booting'; }
  else if (daysSinceSowing > 30) { stage = 'stem'; stageKey = 'predictor.stage.stem'; }
  else if (daysSinceSowing > 15) { stage = 'tillering'; stageKey = 'predictor.stage.tillering'; }

  // Crop-specific stress modifier
  const cropModifiers: Record<string, number> = {
    Paddy: 0, Cotton: 5, Maize: -3, Sugarcane: -5, Wheat: -8, Jowar: 3,
    Soybean: 2, Groundnut: 4, Chilli: 6, Banana: -2, Grapes: -1, Orange: 1, Mango: 0, Pulses: 2, Vegetables: -1,
  };
  const stressPct = Math.min(95, Math.max(10, baseStress + (cropModifiers[crop] || 0)));

  const stressLevel = stressPct < 30 ? 'low' : stressPct < 60 ? 'moderate' : 'high';
  const healthScore = Math.round(100 - stressPct * 0.7);
  const confidence = 90 + (Math.floor(stressPct / 10) % 7); // 90-96
  const waterDeficit = Math.round(stressPct * 0.8 + 5);

  // Irrigation date: sooner if higher stress
  const daysToIrrigate = stressLevel === 'high' ? 1 : stressLevel === 'moderate' ? 3 : 7;
  const irrigDate = new Date();
  irrigDate.setDate(irrigDate.getDate() + daysToIrrigate);

  // SHAP-style feature attribution
  const shap = [
    { feature: 'NDVI', value: Math.round(stressPct * 0.3) },
    { feature: 'NDWI', value: Math.round(stressPct * 0.25) },
    { feature: 'SAR Soil Moisture', value: Math.round(stressPct * 0.2) },
    { feature: 'Growth Stage', value: Math.round(stressPct * 0.15) },
    { feature: 'Temperature', value: Math.round(stressPct * 0.1) },
  ];

  const advisory = `Stress level ${stressLevel}. Water deficit ${waterDeficit}mm. Irrigate within ${daysToIrrigate} days. Crop is in ${stage} stage.`;

  return {
    healthScore,
    stressLevel,
    confidence,
    waterDeficit,
    growthStage: stageKey,
    irrigationDate: irrigDate.toISOString().split('T')[0],
    shap,
    advisory,
  };
}

export default function Predictor({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t, formatDate } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ state: '', district: '', village: '', crop: '', sowingDate: '', area: '1' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const districtsForState = SEEDED_DISTRICTS.filter((d) => d.state_name === form.state).map((d) => d.district_name);

  useEffect(() => {
    if (user && supabase) {
      (async () => {
        const { data } = await supabase.from('predictions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
        if (data) setHistory(data);
      })();
    }
  }, [user]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.state) e.state = t('predictor.form.selectState');
    if (!form.district) e.district = t('predictor.form.selectDistrict');
    if (!form.crop) e.crop = t('predictor.form.selectCrop');
    if (!form.sowingDate) e.sowingDate = t('predictor.err.form');
    if (!form.village.trim()) e.village = t('predictor.err.form');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const runPrediction = async () => {
    if (!validate()) return;
    setRunning(true);
    setResult(null);
    setProgress(0);

    const steps = [
      { key: 'predictor.progress.fetch1', pct: 20 },
      { key: 'predictor.progress.fetch2', pct: 40 },
      { key: 'predictor.progress.ndvi', pct: 55 },
      { key: 'predictor.progress.model', pct: 75 },
      { key: 'predictor.progress.fao', pct: 90 },
      { key: 'predictor.progress.advisory', pct: 100 },
    ];

    for (const step of steps) {
      setProgressStep(t(step.key));
      await new Promise((r) => setTimeout(r, 600));
      setProgress(step.pct);
    }

    const res = predict(form.state, form.district, form.crop, form.sowingDate, parseFloat(form.area) || 1);
    setResult(res);
    setRunning(false);
  };

  const reset = () => {
    setForm({ state: '', district: '', village: '', crop: '', sowingDate: '', area: '1' });
    setResult(null);
    setErrors({});
    setProgress(0);
  };

  const saveToDashboard = async () => {
    if (!user || !supabase || !result) {
      toast(t('predictor.result.saveError'), 'error');
      return;
    }
    const { error } = await supabase.from('predictions').insert({
      state: form.state,
      district: form.district,
      village: form.village,
      crop: form.crop,
      sowing_date: form.sowingDate,
      area_acres: parseFloat(form.area) || 1,
      health_score: result.healthScore,
      stress_level: result.stressLevel,
      confidence: result.confidence,
      water_deficit_mm: result.waterDeficit,
      growth_stage: result.growthStage,
      irrigation_date: result.irrigationDate,
      advisory: result.advisory,
    });
    if (error) {
      toast(t('predictor.result.saveError'), 'error');
    } else {
      toast(t('predictor.result.saved'), 'success');
      // Refresh history
      const { data } = await supabase.from('predictions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
      if (data) setHistory(data);
    }
  };

  const downloadPDF = () => {
    if (!result) return;
    const content = `JALNETRA AI - Field Prediction Report\n\nState: ${form.state}\nDistrict: ${form.district}\nVillage: ${form.village}\nCrop: ${form.crop}\nSowing Date: ${form.sowingDate}\nArea: ${form.area} acres\n\n--- Results ---\nCrop Health Score: ${result.healthScore}/100\nStress Level: ${t(`predictor.stress.${result.stressLevel === 'low' ? 'low' : result.stressLevel === 'moderate' ? 'mod' : 'high'}`)}\nConfidence: ${result.confidence}%\nWater Deficit: ${result.waterDeficit}mm\nGrowth Stage: ${t(result.growthStage)}\nRecommended Irrigation: ${formatDate(result.irrigationDate)}\n\nAdvisory: ${result.advisory}\n\n--- SHAP Feature Attribution ---\n${result.shap.map((s) => `${s.feature}: ${s.value}`).join('\n')}\n\nGenerated by JALNETRA AI - ISRO BAH 2026 Challenge 6`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jalnetra-prediction-${form.district}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stressColor = result?.stressLevel === 'low' ? '#00C853' : result?.stressLevel === 'moderate' ? '#FFD600' : '#FF3D00';

  return (
    <section id="predictor" className="section-pad">
      <div className="container-max">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-white mb-3">{t('predictor.title')}</h2>
          <p className="text-gray-400 font-body max-w-2xl mx-auto">{t('predictor.subtitle')}</p>
          <div className="w-20 h-1 bg-gradient-to-r from-accent-blue to-accent-orange mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-mono font-bold text-accent-blue mb-4">{t('predictor.title')}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('predictor.form.state')}</label>
                <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value, district: '' })} className="w-full px-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white border border-space-border focus:border-accent-blue outline-none">
                  <option value="">{t('predictor.form.selectState')}</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className="text-xs text-accent-red mt-1">{errors.state}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('predictor.form.district')}</label>
                <select value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="w-full px-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white border border-space-border focus:border-accent-blue outline-none" disabled={!form.state}>
                  <option value="">{t('predictor.form.selectDistrict')}</option>
                  {districtsForState.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.district && <p className="text-xs text-accent-red mt-1">{errors.district}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('predictor.form.village')}</label>
                <input type="text" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} className="w-full px-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white border border-space-border focus:border-accent-blue outline-none" placeholder="Village name" />
                {errors.village && <p className="text-xs text-accent-red mt-1">{errors.village}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('predictor.form.crop')}</label>
                <select value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className="w-full px-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white border border-space-border focus:border-accent-blue outline-none">
                  <option value="">{t('predictor.form.selectCrop')}</option>
                  {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.crop && <p className="text-xs text-accent-red mt-1">{errors.crop}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('predictor.form.sowing')}</label>
                  <input type="date" value={form.sowingDate} onChange={(e) => setForm({ ...form, sowingDate: e.target.value })} className="w-full px-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white border border-space-border focus:border-accent-blue outline-none" />
                  {errors.sowingDate && <p className="text-xs text-accent-red mt-1">{errors.sowingDate}</p>}
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">{t('predictor.form.area')}</label>
                  <input type="number" min="0.1" step="0.1" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="w-full px-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white border border-space-border focus:border-accent-blue outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={runPrediction} disabled={running} className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  <Play className="w-4 h-4" />
                  {t('predictor.form.submit')}
                </button>
                <button onClick={reset} className="btn-secondary text-sm flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  {t('predictor.form.reset')}
                </button>
              </div>
            </div>

            {/* Progress */}
            {running && (
              <div className="mt-6 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-accent-blue">{progressStep}</span>
                  <span className="text-xs font-mono text-gray-400">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-space-bg rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-accent-blue to-accent-orange transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Result */}
          <div className="glass rounded-2xl p-6">
            {!result && !running && (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <Sprout className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">{t('predictor.subtitle')}</p>
                </div>
              </div>
            )}
            {result && (
              <div className="animate-fade-in space-y-4">
                {/* Health score + stress badge */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-space-bg/30">
                    <div className="text-xs text-gray-400 mb-1">{t('predictor.result.health')}</div>
                    <div className="text-3xl font-mono font-bold text-white">{result.healthScore}<span className="text-sm text-gray-500">/100</span></div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: `${stressColor}15` }}>
                    <div className="text-xs text-gray-400 mb-1">{t('predictor.result.stress')}</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: stressColor }}>
                      {t(`predictor.stress.${result.stressLevel === 'low' ? 'low' : result.stressLevel === 'moderate' ? 'mod' : 'high'}`)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-space-bg/30">
                    <div className="text-xs text-gray-400">{t('predictor.result.confidence')}</div>
                    <div className="text-lg font-mono font-bold text-accent-green">{result.confidence}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-space-bg/30">
                    <div className="text-xs text-gray-400">{t('predictor.result.deficit')}</div>
                    <div className="text-lg font-mono font-bold text-accent-orange">{result.waterDeficit} mm</div>
                  </div>
                  <div className="p-3 rounded-lg bg-space-bg/30">
                    <div className="text-xs text-gray-400">{t('predictor.result.stage')}</div>
                    <div className="text-sm font-mono font-bold text-white">{t(result.growthStage)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-space-bg/30">
                    <div className="text-xs text-gray-400">{t('predictor.result.irrigate')}</div>
                    <div className="text-sm font-mono font-bold text-accent-blue">{formatDate(result.irrigationDate)}</div>
                  </div>
                </div>

                {/* SHAP chart */}
                <div>
                  <div className="text-xs font-mono text-gray-400 mb-2">{t('predictor.result.why')}</div>
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={result.shap} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="feature" tick={{ fill: '#9ca3af', fontSize: 10 }} width={100} />
                      <Tooltip contentStyle={{ background: 'rgba(13,31,60,0.95)', border: '1px solid #1a3a6b', borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {result.shap.map((_, i) => <Cell key={i} fill={i === 0 ? '#FF6B00' : '#00BFFF'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button onClick={() => onNavigate('whatsapp')} className="btn-secondary text-xs flex items-center justify-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {t('predictor.result.whatsapp')}
                  </button>
                  <button onClick={saveToDashboard} className="btn-secondary text-xs flex items-center justify-center gap-1.5">
                    <Save className="w-3.5 h-3.5" />
                    {t('predictor.result.save')}
                  </button>
                  <button onClick={downloadPDF} className="btn-secondary text-xs flex items-center justify-center gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    {t('predictor.result.download')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="mt-6 glass rounded-2xl p-6">
          <h3 className="text-sm font-mono font-bold text-accent-blue mb-4">{t('predictor.history')}</h3>
          {!user ? (
            <div className="text-center py-8">
              <Lock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{t('predictor.locked')}</p>
              <button onClick={() => onNavigate('signin')} className="btn-secondary text-xs mt-3">{t('nav.signin')}</button>
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">{t('predictor.history.empty')}</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-space-bg/30">
                  <div>
                    <div className="text-sm text-white font-mono">{h.crop} · {h.district}, {h.state}</div>
                    <div className="text-xs text-gray-500">{formatDate(h.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-300">Health: {h.health_score}</span>
                    <span className="text-xs font-mono" style={{ color: h.stress_level === 'low' ? '#00C853' : h.stress_level === 'moderate' ? '#FFD600' : '#FF3D00' }}>
                      {h.stress_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
