import { useI18n } from '../i18n/I18nContext';
import { useInView, useCountUp, useReveal } from '../hooks/useReveal';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Activity, AlertTriangle, Droplets, Zap, MessageSquare, MapPin } from 'lucide-react';

function genTrend(base: number, vol: number, n = 14) {
  return Array.from({ length: n }, (_, i) => ({
    day: i + 1,
    value: Number((base + Math.sin(i * 0.5) * vol + i * 0.005).toFixed(3)),
  }));
}

export default function DashboardPreview() {
  const { t } = useI18n();
  const { ref, visible } = useReveal<HTMLDivElement>();
  const { ref: statRef, inView } = useInView<HTMLDivElement>(0.2);

  const stats = [
    { icon: MapPin, value: 12450, label: t('dash.stat.fields'), color: 'text-accent-blue' },
    { icon: AlertTriangle, value: 23, label: t('dash.stat.alerts'), color: 'text-accent-red' },
    { icon: Droplets, value: 4.2, label: t('dash.stat.water'), color: 'text-accent-green', suffix: 'M L' },
    { icon: Zap, value: 99.8, label: t('dash.stat.uptime'), color: 'text-accent-orange', suffix: '%' },
  ];

  const shapData = [
    { feature: 'NDVI', value: 28 },
    { feature: 'NDWI', value: 22 },
    { feature: 'SAR Moisture', value: 18 },
    { feature: 'Growth Stage', value: 15 },
    { feature: 'Temperature', value: 10 },
    { feature: 'Rainfall', value: 7 },
  ];

  return (
    <section id="dashboard" className="section-pad">
      <div ref={ref} className={`container-max reveal ${visible ? 'is-visible' : ''}`}>
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-white mb-3">{t('dash.title')}</h2>
          <p className="text-gray-400 font-body max-w-2xl mx-auto">{t('dash.subtitle')}</p>
          <div className="w-20 h-1 bg-gradient-to-r from-accent-blue to-accent-orange mx-auto mt-4 rounded-full" />
        </div>

        {/* Stat strip */}
        <div ref={statRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <DashStat key={i} {...s} start={inView} delay={i * 150} />
          ))}
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Field Inspector */}
          <div className="glass rounded-xl p-5 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-accent-blue" />
              <h3 className="text-sm font-mono font-bold text-white">{t('dash.inspector')}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Field ID</span><span className="text-white font-mono">AP-WG-0042</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Crop</span><span className="text-white">Paddy</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Stage</span><span className="text-accent-blue">Flowering</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Health</span><span className="text-accent-green font-mono">78/100</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Stress</span><span className="text-accent-yellow font-mono">Moderate (45%)</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Deficit</span><span className="text-accent-orange font-mono">35mm</span></div>
              <div className="pt-2 border-t border-space-border">
                <div className="text-xs text-gray-400 mb-1">Recommended Action</div>
                <div className="text-sm text-white">Irrigate within 3 days</div>
              </div>
            </div>
          </div>

          {/* SHAP */}
          <div className="glass rounded-xl p-5 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-accent-orange" />
              <h3 className="text-sm font-mono font-bold text-white">{t('dash.shap')}</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={shapData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="feature" tick={{ fill: '#9ca3af', fontSize: 10 }} width={90} />
                <Tooltip contentStyle={{ background: 'rgba(13,31,60,0.95)', border: '1px solid #1a3a6b', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {shapData.map((_, i) => <Cell key={i} fill={i < 2 ? '#FF6B00' : '#00BFFF'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* WhatsApp Gateway */}
          <div className="glass rounded-xl p-5 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-accent-green" />
              <h3 className="text-sm font-mono font-bold text-white">{t('dash.gateway')}</h3>
            </div>
            <div className="space-y-2">
              <div className="bg-[#0a1f12] rounded-lg p-3 border border-accent-green/20">
                <div className="text-xs text-accent-green font-mono mb-1">JALNETRA AI → +91 98765 43210</div>
                <div className="text-xs text-gray-200">Paddy in West Godavari: Stress Moderate, Deficit 35mm. Irrigate within 3 days.</div>
              </div>
              <div className="bg-[#0a1f12] rounded-lg p-3 border border-accent-green/20">
                <div className="text-xs text-accent-green font-mono mb-1">JALNETRA AI → +91 87654 32109</div>
                <div className="text-xs text-gray-200">Cotton in Warangal: Stress High, Deficit 48mm. Irrigate within 2 days.</div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-400">Sent today</span>
                <span className="text-sm font-mono font-bold text-accent-green">1,247</span>
              </div>
            </div>
          </div>

          {/* NDVI Trend */}
          <div className="glass rounded-xl p-5">
            <div className="text-xs font-mono text-gray-400 mb-2">{t('dash.ndvi')}</div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={genTrend(0.5, 0.05)}>
                <defs>
                  <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00BFFF" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#00BFFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis domain={[0, 1]} hide />
                <Tooltip contentStyle={{ background: 'rgba(13,31,60,0.95)', border: '1px solid #1a3a6b', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="#00BFFF" strokeWidth={2} fill="url(#ndviGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Soil Moisture */}
          <div className="glass rounded-xl p-5">
            <div className="text-xs font-mono text-gray-400 mb-2">{t('dash.moisture')}</div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={genTrend(0.35, 0.08)}>
                <defs>
                  <linearGradient id="moistGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00C853" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#00C853" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis domain={[0, 1]} hide />
                <Tooltip contentStyle={{ background: 'rgba(13,31,60,0.95)', border: '1px solid #1a3a6b', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="value" stroke="#00C853" strokeWidth={2} fill="url(#moistGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Stress Index */}
          <div className="glass rounded-xl p-5">
            <div className="text-xs font-mono text-gray-400 mb-2">{t('dash.stress')}</div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={genTrend(0.45, 0.1)}>
                <XAxis dataKey="day" hide />
                <YAxis domain={[0, 1]} hide />
                <Tooltip contentStyle={{ background: 'rgba(13,31,60,0.95)', border: '1px solid #1a3a6b', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="value" stroke="#FF6B00" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashStat({ icon: Icon, value, label, color, start, delay, suffix = '' }: { icon: typeof Activity; value: number; label: string; color: string; start: boolean; delay: number; suffix?: string }) {
  const count = useCountUp(value, 1500, start);
  const display = value < 100 ? count.toFixed(1) : Math.round(count).toLocaleString('en-IN');
  return (
    <div className="glass rounded-xl p-4 flex items-center gap-3" style={{ opacity: 0, animation: start ? 'slideUp 0.6s forwards' : 'none', animationDelay: `${delay}ms` }}>
      <Icon className={`w-6 h-6 ${color} flex-shrink-0`} />
      <div>
        <div className="text-xl font-mono font-bold text-white">{display}{suffix}</div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    </div>
  );
}
