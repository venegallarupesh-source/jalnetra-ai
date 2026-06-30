import { useState, useMemo, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SEEDED_DISTRICTS, STATES, CROPS, type DistrictStress } from '../data/districts';
import { useInView, useCountUp } from '../hooks/useReveal';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Lock, Download, X, MapPin, RefreshCw, Satellite, Users, Droplets } from 'lucide-react';

const STRESS_COLORS = {
  low: '#00C853',
  moderate: '#FFD600',
  high: '#FF3D00',
};

interface MapProps {
  onNavigate: (page: string) => void;
}

export default function CropMap({ onNavigate }: MapProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { ref, inView } = useInView<HTMLDivElement>(0.1);
  const [districts, setDistricts] = useState<DistrictStress[]>(SEEDED_DISTRICTS);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DistrictStress | null>(null);
  const [search, setSearch] = useState('');
  const [filterCrop, setFilterCrop] = useState('all');
  const [filterStress, setFilterStress] = useState('all');
  const [filterState, setFilterState] = useState('all');

  // Fetch from Supabase if configured, else use seeded data
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase.from('district_stress_data').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          setDistricts(data as unknown as DistrictStress[]);
        }
      } catch (e) {
        console.error('Map data fetch failed, using seeded data:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return districts.filter((d) => {
      if (search && !d.district_name.toLowerCase().includes(search.toLowerCase()) && !d.state_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCrop !== 'all' && d.dominant_crop !== filterCrop) return false;
      if (filterStress !== 'all' && d.stress_level !== filterStress) return false;
      if (filterState !== 'all' && d.state_name !== filterState) return false;
      return true;
    });
  }, [districts, search, filterCrop, filterStress, filterState]);

  // Map projection: simple linear mapping of lat/lon to SVG coords
  // India roughly: lon 68-97, lat 8-37
  const project = (lat: number, lon: number) => {
    const x = ((lon - 68) / (97 - 68)) * 100;
    const y = ((37 - lat) / (37 - 8)) * 100;
    return { x, y };
  };

  const isLocked = !user;

  const stats = {
    districts: districts.length,
    farmers: 200000,
    waterSaved: 38,
    passes: 12,
  };

  return (
    <section id="map" className="section-pad relative">
      <div ref={ref} className="container-max">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-white mb-3">{t('map.title')}</h2>
          <p className="text-gray-400 font-body max-w-2xl mx-auto">{t('map.subtitle')}</p>
          <div className="w-20 h-1 bg-gradient-to-r from-accent-blue to-accent-orange mx-auto mt-4 rounded-full" />
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatBox icon={MapPin} value={stats.districts} label={t('map.stat.districts')} start={inView} color="text-accent-blue" />
          <StatBox icon={Users} value={stats.farmers} label={t('map.stat.farmers')} start={inView} color="text-accent-green" suffix="+" />
          <StatBox icon={Droplets} value={stats.waterSaved} label={t('map.stat.waterSaved')} start={inView} color="text-accent-blue" suffix="%" />
          <StatBox icon={Satellite} value={stats.passes} label={t('map.stat.passes')} start={inView} color="text-accent-orange" />
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder={t('map.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white placeholder-gray-500 border border-space-border focus:border-accent-blue outline-none"
              />
            </div>
            <select value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)} className="px-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white border border-space-border focus:border-accent-blue outline-none" aria-label={t('map.filter.crop')}>
              <option value="all">{t('map.filter.crop')}: {t('common.all')}</option>
              {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterStress} onChange={(e) => setFilterStress(e.target.value)} className="px-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white border border-space-border focus:border-accent-blue outline-none" aria-label={t('map.filter.stress')}>
              <option value="all">{t('map.filter.stress')}: {t('common.all')}</option>
              <option value="low">{t('map.filter.low')}</option>
              <option value="moderate">{t('map.filter.mod')}</option>
              <option value="high">{t('map.filter.high')}</option>
            </select>
            <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="px-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white border border-space-border focus:border-accent-blue outline-none" aria-label={t('map.filter.state')}>
              <option value="all">{t('map.filter.state')}: {t('common.all')}</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 glass rounded-2xl p-4 relative overflow-hidden" style={{ minHeight: '500px' }}>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="skeleton w-full h-full rounded-xl" />
              </div>
            ) : (
              <>
                <div className="relative w-full" style={{ aspectRatio: '1 / 1.1' }} aria-label={t('map.title')} role="img">
                  <svg viewBox="0 0 100 110" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                    {/* India outline (simplified) */}
                    <path
                      d="M20,15 L35,8 L50,10 L65,15 L75,25 L80,35 L78,45 L72,55 L68,65 L60,75 L55,85 L50,95 L45,100 L40,95 L35,85 L30,75 L25,65 L22,55 L18,45 L15,35 L18,25 Z"
                      fill="rgba(13,31,60,0.5)"
                      stroke="#1a3a6b"
                      strokeWidth="0.3"
                    />
                    {/* District markers */}
                    {filtered.map((d) => {
                      const { x, y } = project(d.latitude, d.longitude);
                      const color = STRESS_COLORS[d.stress_level];
                      return (
                        <g key={d.id} onClick={() => setSelected(d)} className="cursor-pointer">
                          <circle cx={x} cy={y} r="2.5" fill={color} opacity="0.8" className="hover:opacity-100 transition-opacity">
                            <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
                          </circle>
                          <circle cx={x} cy={y} r="1.5" fill={color} />
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 glass rounded-lg p-3">
                  <div className="text-xs font-mono text-gray-400 mb-2">{t('map.legend')}</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: STRESS_COLORS.low }} /><span className="text-xs text-gray-300">{t('map.legend.low')}</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: STRESS_COLORS.moderate }} /><span className="text-xs text-gray-300">{t('map.legend.mod')}</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: STRESS_COLORS.high }} /><span className="text-xs text-gray-300">{t('map.legend.high')}</span></div>
                  </div>
                </div>

                <button
                  onClick={() => { setFilterCrop('all'); setFilterStress('all'); setFilterState('all'); setSearch(''); }}
                  className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 glass rounded-lg text-xs text-gray-300 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  {t('map.reset')}
                </button>

                {/* Locked overlay */}
                {isLocked && (
                  <div className="absolute inset-0 backdrop-blur-md bg-space-bg/60 flex items-center justify-center z-10">
                    <div className="text-center max-w-sm px-6">
                      <Lock className="w-12 h-12 text-accent-orange mx-auto mb-4" />
                      <h3 className="text-lg font-mono font-bold text-white mb-2">{t('map.locked')}</h3>
                      <p className="text-sm text-gray-400 mb-4">{t('map.locked.desc')}</p>
                      <button onClick={() => onNavigate('signup')} className="btn-primary text-xs">
                        {t('nav.signup')}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Side panel / District list */}
          <div className="glass rounded-2xl p-4 max-h-[500px] overflow-y-auto">
            {selected ? (
              <DistrictPanel district={selected} onClose={() => setSelected(null)} />
            ) : (
              <div>
                <h3 className="text-sm font-mono font-bold text-white mb-3">{filtered.length} districts</h3>
                <div className="space-y-2">
                  {filtered.slice(0, 20).map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelected(d)}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-space-bg/30 hover:bg-white/5 transition-colors text-left"
                    >
                      <div>
                        <div className="text-sm text-white font-mono">{d.district_name}</div>
                        <div className="text-xs text-gray-500">{d.state_name} · {d.dominant_crop}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: STRESS_COLORS[d.stress_level] }} />
                        <span className="text-xs font-mono text-gray-300">{d.stress_pct}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBox({ icon: Icon, value, label, start, color, suffix = '' }: { icon: typeof MapPin; value: number; label: string; start: boolean; color: string; suffix?: string }) {
  const count = useCountUp(value, 1500, start);
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-3">
      <Icon className={`w-6 h-6 ${color} flex-shrink-0`} />
      <div>
        <div className="text-xl font-mono font-bold text-white">{Math.round(count)}{suffix}</div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    </div>
  );
}

function DistrictPanel({ district, onClose }: { district: DistrictStress; onClose: () => void }) {
  const { t, formatDate } = useI18n();
  const pieData = district.crop_breakdown.map((c) => ({ name: c.crop, value: c.pct }));
  const ndviData = district.ndvi_trend.map((v, i) => ({ day: i + 1, value: v }));
  const PIE_COLORS = ['#00BFFF', '#FF6B00', '#00C853', '#FFD600', '#FF3D00'];
  const color = STRESS_COLORS[district.stress_level];

  const handleDownload = () => {
    const csv = `District,${district.district_name}\nState,${district.state_name}\nDominant Crop,${district.dominant_crop}\nStress %,${district.stress_pct}\nStress Level,${district.stress_level}\nWater Deficit (mm),${district.water_deficit_mm}\nAdvisory,${district.advisory}\n\nCrop Breakdown\n${district.crop_breakdown.map((c) => `${c.crop},${c.pct}%`).join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jalnetra-${district.district_name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-mono font-bold text-white">{district.district_name}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label={t('map.panel.close')}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm"><span className="text-gray-400">{t('map.panel.district')}</span><span className="text-white font-mono">{district.district_name}, {district.state_name}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-400">{t('map.panel.crop')}</span><span className="text-white font-mono">{district.dominant_crop}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-400">{t('map.panel.stress')}</span><span className="font-mono font-bold" style={{ color }}>{district.stress_pct}% ({t(`map.filter.${district.stress_level === 'low' ? 'low' : district.stress_level === 'moderate' ? 'mod' : 'high'}`)})</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-400">{t('map.panel.deficit')}</span><span className="text-white font-mono">{district.water_deficit_mm} mm</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-400">{t('map.panel.updated')}</span><span className="text-gray-300 font-mono text-xs">{formatDate(new Date())}</span></div>
      </div>

      {/* Crop breakdown pie */}
      <div className="mb-4">
        <div className="text-xs font-mono text-gray-400 mb-2">{t('map.panel.breakdown')}</div>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} innerRadius={25}>
              {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: 'rgba(13,31,60,0.95)', border: '1px solid #1a3a6b', borderRadius: '8px', fontSize: '12px' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 justify-center">
          {pieData.map((d, i) => (
            <div key={i} className="flex items-center gap-1 text-xs text-gray-400">
              <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
              {d.name} {d.value}%
            </div>
          ))}
        </div>
      </div>

      {/* NDVI trend */}
      <div className="mb-4">
        <div className="text-xs font-mono text-gray-400 mb-2">{t('map.panel.ndvi')}</div>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={ndviData}>
            <XAxis dataKey="day" hide />
            <YAxis domain={[0, 1]} hide />
            <Tooltip contentStyle={{ background: 'rgba(13,31,60,0.95)', border: '1px solid #1a3a6b', borderRadius: '8px', fontSize: '12px' }} />
            <Line type="monotone" dataKey="value" stroke="#00BFFF" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Advisory */}
      <div className="mb-4 p-3 rounded-lg bg-space-bg/30">
        <div className="text-xs font-mono text-gray-400 mb-1">{t('map.panel.advisory')}</div>
        <p className="text-sm text-gray-300">{district.advisory}</p>
      </div>

      <button onClick={handleDownload} className="w-full btn-secondary text-xs flex items-center justify-center gap-2">
        <Download className="w-3.5 h-3.5" />
        {t('map.panel.download')}
      </button>
    </div>
  );
}
