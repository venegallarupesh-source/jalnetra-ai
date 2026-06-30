import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useReveal } from '../hooks/useReveal';
import Starfield from './Starfield';
import {
  AlertTriangle, Droplets, TrendingDown, Clock, Satellite, Cpu, MessageSquare,
  LayoutDashboard, Layers, Brain, GitBranch, ShieldCheck, Target, RefreshCw, Rocket,
  Cloud, Code, Quote, ChevronDown, Linkedin, Mail, MapPin,
} from 'lucide-react';

// Reusable section wrapper with scroll reveal
function Section({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <section id={id} className={`section-pad ${className}`}>
      <div ref={ref} className={`container-max reveal ${visible ? 'is-visible' : ''}`}>
        {children}
      </div>
    </section>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-white mb-3">{title}</h2>
      {subtitle && <p className="text-gray-400 font-body max-w-2xl mx-auto">{subtitle}</p>}
      <div className="w-20 h-1 bg-gradient-to-r from-accent-blue to-accent-orange mx-auto mt-4 rounded-full" />
    </div>
  );
}

// 3. Problem
export function ProblemSection() {
  const { t } = useI18n();
  const stats = [
    { value: t('problem.stat1.value'), label: t('problem.stat1.label'), source: t('problem.stat1.source'), icon: AlertTriangle, color: 'text-accent-red' },
    { value: t('problem.stat2.value'), label: t('problem.stat2.label'), source: t('problem.stat2.source'), icon: Droplets, color: 'text-accent-blue' },
    { value: t('problem.stat3.value'), label: t('problem.stat3.label'), source: t('problem.stat3.source'), icon: TrendingDown, color: 'text-accent-orange' },
    { value: t('problem.stat4.value'), label: t('problem.stat4.label'), source: t('problem.stat4.source'), icon: Clock, color: 'text-accent-yellow' },
  ];
  return (
    <Section id="problem">
      <SectionTitle title={t('problem.title')} subtitle={t('problem.subtitle')} />
      <div className="max-w-3xl mx-auto mb-12">
        <div className="glass glass-glow-orange rounded-2xl p-8 relative">
          <Quote className="absolute top-4 left-4 w-8 h-8 text-accent-orange/30" />
          <p className="text-lg sm:text-xl text-white font-body italic mb-4 pl-8">{t('problem.quote')}</p>
          <p className="text-sm text-gray-400 pl-8">— {t('problem.quoteAttr')}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="glass rounded-xl p-6 card-hover">
            <s.icon className={`w-8 h-8 ${s.color} mb-3`} />
            <div className="text-3xl font-mono font-bold text-white mb-1">{s.value}</div>
            <div className="text-sm text-gray-400 mb-2">{s.label}</div>
            <div className="text-xs text-gray-500 font-mono">{s.source}</div>
          </div>
        ))}
      </div>
      <div className="glass glass-glow-red rounded-xl p-6 text-center">
        <p className="text-lg text-white font-body">{t('problem.banner')}</p>
      </div>
    </Section>
  );
}

// 4. Why Short
export function WhyShortSection() {
  const { t } = useI18n();
  const rows = [1, 2, 3, 4];
  return (
    <Section id="whyshort">
      <SectionTitle title={t('whyshort.title')} subtitle={t('whyshort.subtitle')} />
      <div className="overflow-x-auto">
        <table className="w-full glass rounded-xl overflow-hidden">
          <thead>
            <tr className="border-b border-space-border">
              <th className="text-left p-4 text-sm font-mono text-accent-blue">{t('whyshort.col.system')}</th>
              <th className="text-left p-4 text-sm font-mono text-accent-blue">{t('whyshort.col.gap')}</th>
              <th className="text-left p-4 text-sm font-mono text-accent-blue">{t('whyshort.col.latency')}</th>
              <th className="text-left p-4 text-sm font-mono text-accent-blue">{t('whyshort.col.delivery')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r} className={`border-b border-space-border/50 ${r === 4 ? 'bg-accent-blue/5' : ''}`}>
                <td className="p-4 text-sm font-mono font-bold text-white">{t(`whyshort.row${r}`)}</td>
                <td className="p-4 text-sm text-gray-300">{t(`whyshort.row${r}.gap`)}</td>
                <td className="p-4 text-sm text-gray-300 font-mono">{t(`whyshort.row${r}.latency`)}</td>
                <td className="p-4 text-sm text-gray-300">{t(`whyshort.row${r}.delivery`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// 5. Solution
export function SolutionSection() {
  const { t } = useI18n();
  const quadrants = [
    { icon: Satellite, title: t('solution.q1.title'), desc: t('solution.q1.desc'), color: 'text-accent-blue', glow: 'glass-glow-blue' },
    { icon: Cpu, title: t('solution.q2.title'), desc: t('solution.q2.desc'), color: 'text-accent-orange', glow: 'glass-glow-orange' },
    { icon: MessageSquare, title: t('solution.q3.title'), desc: t('solution.q3.desc'), color: 'text-accent-green', glow: 'glass-glow-green' },
    { icon: LayoutDashboard, title: t('solution.q4.title'), desc: t('solution.q4.desc'), color: 'text-accent-blue', glow: 'glass-glow-blue' },
  ];
  return (
    <Section id="solution">
      <SectionTitle title={t('solution.title')} subtitle={t('solution.subtitle')} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quadrants.map((q, i) => (
          <div key={i} className={`glass ${q.glow} rounded-2xl p-8 card-hover`}>
            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-4">
              <q.icon className={`w-7 h-7 ${q.color}`} />
            </div>
            <h3 className="text-xl font-mono font-bold text-white mb-2">{q.title}</h3>
            <p className="text-gray-400 font-body">{q.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// 6. Innovation
export function InnovationSection() {
  const { t } = useI18n();
  const items = [
    { icon: Layers, title: t('innovation.i1.title'), desc: t('innovation.i1.desc') },
    { icon: GitBranch, title: t('innovation.i2.title'), desc: t('innovation.i2.desc') },
    { icon: Brain, title: t('innovation.i3.title'), desc: t('innovation.i3.desc') },
    { icon: ShieldCheck, title: t('innovation.i4.title'), desc: t('innovation.i4.desc') },
    { icon: Target, title: t('innovation.i5.title'), desc: t('innovation.i5.desc') },
    { icon: RefreshCw, title: t('innovation.i6.title'), desc: t('innovation.i6.desc') },
    { icon: Rocket, title: t('innovation.i7.title'), desc: t('innovation.i7.desc') },
  ];
  return (
    <Section id="innovation">
      <SectionTitle title={t('innovation.title')} subtitle={t('innovation.subtitle')} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <div key={i} className="glass rounded-xl p-6 card-hover">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-gray-400 font-body">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// 7. Architecture
export function ArchitectureSection() {
  const { t } = useI18n();
  const layers = [
    { icon: Satellite, title: t('arch.l1'), desc: t('arch.l1.desc'), color: 'text-accent-blue' },
    { icon: Cpu, title: t('arch.l2'), desc: t('arch.l2.desc'), color: 'text-accent-orange' },
    { icon: Brain, title: t('arch.l3'), desc: t('arch.l3.desc'), color: 'text-accent-green' },
    { icon: MessageSquare, title: t('arch.l4'), desc: t('arch.l4.desc'), color: 'text-accent-blue' },
  ];
  return (
    <Section id="architecture">
      <SectionTitle title={t('arch.title')} subtitle={t('arch.subtitle')} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {layers.map((l, i) => (
          <div key={i} className="relative">
            <div className="glass glass-glow-blue rounded-xl p-6 card-hover h-full">
              <div className="text-xs font-mono text-gray-500 mb-2">LAYER {i + 1}</div>
              <l.icon className={`w-10 h-10 ${l.color} mb-3`} />
              <h3 className="text-base font-mono font-bold text-white mb-2">{l.title}</h3>
              <p className="text-xs text-gray-400 font-body">{l.desc}</p>
            </div>
            {i < layers.length - 1 && (
              <div className="hidden lg:flex absolute top-1/2 -right-2 -translate-y-1/2 z-10">
                <div className="w-4 h-0.5 bg-gradient-to-r from-accent-blue to-accent-orange" />
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

// 8. Pipeline
export function PipelineSection() {
  const { t } = useI18n();
  const stages = [1, 2, 3, 4, 5, 6, 7];
  return (
    <Section id="pipeline">
      <SectionTitle title={t('pipeline.title')} subtitle={t('pipeline.subtitle')} />
      <div className="overflow-x-auto">
        <table className="w-full glass rounded-xl overflow-hidden">
          <thead>
            <tr className="border-b border-space-border">
              <th className="text-left p-3 text-xs font-mono text-accent-blue">{t('pipeline.col.stage')}</th>
              <th className="text-left p-3 text-xs font-mono text-accent-blue">{t('pipeline.col.input')}</th>
              <th className="text-left p-3 text-xs font-mono text-accent-blue">{t('pipeline.col.model')}</th>
              <th className="text-left p-3 text-xs font-mono text-accent-blue">{t('pipeline.col.output')}</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((s) => (
              <tr key={s} className="border-b border-space-border/50 hover:bg-white/5 transition-colors">
                <td className="p-3 text-xs font-mono font-bold text-white whitespace-nowrap">{t(`pipeline.s${s}.stage`)}</td>
                <td className="p-3 text-xs text-gray-300">{t(`pipeline.s${s}.input`)}</td>
                <td className="p-3 text-xs text-accent-orange font-mono">{t(`pipeline.s${s}.model`)}</td>
                <td className="p-3 text-xs text-gray-300">{t(`pipeline.s${s}.output`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// 11. Tech Stack
export function TechStackSection() {
  const { t } = useI18n();
  const cats = [
    { title: t('tech.cat1'), icon: Satellite, items: ['Sentinel-2', 'EOS-04 RISAT', 'NISAR (ready)', 'IMD Weather', 'Copernicus Hub'] },
    { title: t('tech.cat2'), icon: Brain, items: ['ConvLSTM', 'Attention U-Net', 'Random Forest', 'FAO-56 ETc', 'SHAP Explainability'] },
    { title: t('tech.cat3'), icon: Cloud, items: ['Supabase', 'PostgreSQL', 'Edge Functions', 'Twilio API', 'Deno Runtime'] },
    { title: t('tech.cat4'), icon: Code, items: ['React + TypeScript', 'Tailwind CSS', 'Recharts', 'Leaflet', 'i18n (6 langs)'] },
  ];
  return (
    <Section id="tech">
      <SectionTitle title={t('tech.title')} subtitle={t('tech.subtitle')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cats.map((c, i) => (
          <div key={i} className="glass rounded-xl p-6 card-hover">
            <c.icon className="w-8 h-8 text-accent-blue mb-4" />
            <h3 className="text-sm font-mono font-bold text-white mb-3">{c.title}</h3>
            <ul className="space-y-2">
              {c.items.map((item, j) => (
                <li key={j} className="text-xs text-gray-400 font-body flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-accent-orange" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

// 13. Results
export function ResultsSection() {
  const { t } = useI18n();
  const rows = [1, 2, 3, 4, 5, 6];
  return (
    <Section id="results">
      <SectionTitle title={t('results.title')} subtitle={t('results.subtitle')} />
      <div className="overflow-x-auto mb-6">
        <table className="w-full glass rounded-xl overflow-hidden">
          <thead>
            <tr className="border-b border-space-border">
              <th className="text-left p-4 text-sm font-mono text-accent-blue">{t('results.col.metric')}</th>
              <th className="text-left p-4 text-sm font-mono text-accent-blue">{t('results.col.pilot')}</th>
              <th className="text-left p-4 text-sm font-mono text-accent-blue">{t('results.col.target')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r} className="border-b border-space-border/50">
                <td className="p-4 text-sm text-white">{t(`results.r${r}`)}</td>
                <td className="p-4 text-sm font-mono font-bold text-accent-green">{t(`results.r${r}.pilot`)}</td>
                <td className="p-4 text-sm font-mono text-gray-400">{t(`results.r${r}.target`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="glass glass-glow-green rounded-xl p-6 text-center">
        <p className="text-lg text-white font-body">{t('results.correlation')}</p>
      </div>
    </Section>
  );
}

// 14. Scalability
export function ScalabilitySection() {
  const { t } = useI18n();
  const phases = [1, 2, 3, 4, 5];
  return (
    <Section id="scale">
      <SectionTitle title={t('scale.title')} subtitle={t('scale.subtitle')} />
      <div className="relative">
        <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-blue via-accent-orange to-accent-green" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {phases.map((p) => (
            <div key={p} className="relative">
              <div className="glass rounded-xl p-6 card-hover text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-blue to-accent-orange mx-auto mb-3 flex items-center justify-center text-white font-mono font-bold text-lg relative z-10">
                  {p}
                </div>
                <h3 className="text-sm font-mono font-bold text-white mb-1">{t(`scale.p${p}`)}</h3>
                <p className="text-xs text-gray-400 font-body">{t(`scale.p${p}.desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// 15. Competitive
export function CompetitiveSection() {
  const { t } = useI18n();
  const rows = [1, 2, 3, 4, 5, 6];
  return (
    <Section id="competitive">
      <SectionTitle title={t('comp.title')} subtitle={t('comp.subtitle')} />
      <div className="overflow-x-auto">
        <table className="w-full glass rounded-xl overflow-hidden">
          <thead>
            <tr className="border-b border-space-border">
              <th className="text-left p-3 text-xs font-mono text-accent-blue">{t('comp.col.feature')}</th>
              <th className="text-left p-3 text-xs font-mono text-accent-orange">{t('comp.col.jalnetra')}</th>
              <th className="text-left p-3 text-xs font-mono text-gray-400">{t('comp.col.fasal')}</th>
              <th className="text-left p-3 text-xs font-mono text-gray-400">{t('comp.col.satsure')}</th>
              <th className="text-left p-3 text-xs font-mono text-gray-400">{t('comp.col.harvest')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r} className="border-b border-space-border/50">
                <td className="p-3 text-xs text-white font-medium">{t(`comp.row${r}`)}</td>
                <td className="p-3 text-xs font-mono font-bold text-accent-orange">{t(`comp.row${r}.j`)}</td>
                <td className="p-3 text-xs text-gray-400">{t(`comp.row${r}.f`)}</td>
                <td className="p-3 text-xs text-gray-400">{t(`comp.row${r}.s`)}</td>
                <td className="p-3 text-xs text-gray-400">{t(`comp.row${r}.h`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// 16. Plan
export function PlanSection() {
  const { t } = useI18n();
  const phases = [1, 2, 3, 4, 5, 6];
  return (
    <Section id="plan">
      <SectionTitle title={t('plan.title')} subtitle={t('plan.subtitle')} />
      <div className="space-y-3">
        {phases.map((p) => (
          <div key={p} className="glass rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 card-hover">
            <div className="flex items-center gap-3 sm:w-64 flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center font-mono font-bold text-accent-blue">
                {p}
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-white">{t(`plan.p${p}`)}</h3>
                <div className="text-xs text-accent-orange font-mono">{t(`plan.p${p}.h`)}</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 font-body flex-1">{t(`plan.p${p}.d`)}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// 17. Business
export function BusinessSection() {
  const { t } = useI18n();
  const cards = [
    { title: t('biz.r.title'), desc: t('biz.r.desc'), icon: TrendingDown, color: 'text-accent-green' },
    { title: t('biz.f.title'), desc: t('biz.f.desc'), icon: Rocket, color: 'text-accent-blue' },
    { title: t('biz.s.title'), desc: t('biz.s.desc'), icon: Target, color: 'text-accent-orange' },
    { title: t('biz.i.title'), desc: t('biz.i.desc'), icon: ShieldCheck, color: 'text-accent-blue' },
  ];
  return (
    <Section id="business">
      <SectionTitle title={t('biz.title')} subtitle={t('biz.subtitle')} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="glass rounded-2xl p-8 card-hover">
            <c.icon className={`w-10 h-10 ${c.color} mb-4`} />
            <h3 className="text-lg font-mono font-bold text-white mb-3">{c.title}</h3>
            <p className="text-sm text-gray-400 font-body">{c.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// 18. Testimonials
export function TestimonialsSection() {
  const { t } = useI18n();
  const testimonials = [1, 2, 3];
  return (
    <Section id="testimonials">
      <SectionTitle title={t('test.title')} subtitle={t('test.subtitle')} />
      <div className="flex items-center justify-center gap-2 mb-8">
        <span className="px-3 py-1 rounded-full bg-accent-yellow/10 text-accent-yellow text-xs font-mono">
          {t('test.note')}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((i) => (
          <div key={i} className="glass rounded-2xl p-6 card-hover">
            <Quote className="w-8 h-8 text-accent-blue/30 mb-3" />
            <p className="text-sm text-gray-300 font-body italic mb-4">"{t(`test.t${i}.quote`)}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-accent-orange flex items-center justify-center text-white font-mono font-bold text-sm">
                {t(`test.t${i}.name`).charAt(0)}
              </div>
              <div>
                <div className="text-sm font-mono font-bold text-white">{t(`test.t${i}.name`)}</div>
                <div className="text-xs text-gray-400">{t(`test.t${i}.role`)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// 19. FAQ
export function FAQSection() {
  const { t } = useI18n();
  const faqs = [1, 2, 3, 4, 5, 6, 7, 8];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section id="faq">
      <SectionTitle title={t('faq.title')} subtitle={t('faq.subtitle')} />
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((i) => (
          <div key={i} className="glass rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left"
              aria-expanded={open === i}
            >
              <span className="text-sm font-mono font-bold text-white">{t(`faq.q${i}`)}</span>
              <ChevronDown className={`w-4 h-4 text-accent-blue flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && (
              <div className="px-5 pb-5 animate-fade-in">
                <p className="text-sm text-gray-400 font-body">{t(`faq.a${i}`)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}

// 20. Team
export function TeamSection() {
  const { t } = useI18n();
  const members = [
    { name: t('team.t1.name'), role: t('team.t1.role'), linkedin: 'https://www.linkedin.com/in/venegalla-rupesh-691536386', skills: ['AI/ML', 'ConvLSTM', 'Systems', 'Leadership'] },
    { name: t('team.t2.name'), role: t('team.t2.role'), linkedin: 'https://www.linkedin.com/in/hema-sundhar-pedada-585a54387', skills: ['Remote Sensing', 'SAR', 'Data Pipeline', 'GIS'] },
    { name: t('team.t3.name'), role: t('team.t3.role'), linkedin: 'https://www.linkedin.com/in/saharsh-chowdary-narra-4088a2369', skills: ['Full-Stack', 'React', 'WhatsApp API', 'i18n'] },
  ];
  return (
    <Section id="team">
      <SectionTitle title={t('team.title')} subtitle={t('team.subtitle')} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {members.map((m, i) => (
          <div key={i} className="glass glass-glow-blue rounded-2xl p-8 text-center card-hover">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-blue to-accent-orange mx-auto mb-4 flex items-center justify-center text-white font-mono font-bold text-2xl">
              {m.name.split(' ').map((n) => n.charAt(0)).join('').slice(0, 2)}
            </div>
            <h3 className="text-lg font-mono font-bold text-white mb-1">{m.name}</h3>
            <p className="text-sm text-accent-blue mb-4">{m.role}</p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {m.skills.map((s, j) => (
                <span key={j} className="px-2 py-1 rounded-md bg-white/5 text-xs text-gray-300 font-mono">{s}</span>
              ))}
            </div>
            <a
              href={m.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A66C2]/20 text-[#4ea0ff] hover:bg-[#0A66C2]/30 transition-colors text-sm font-mono"
            >
              <Linkedin className="w-4 h-4" />
              {t('team.linkedin')}
            </a>
          </div>
        ))}
      </div>
    </Section>
  );
}

// 21. Footer
export function Footer({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t } = useI18n();
  return (
    <footer className="relative section-pad border-t border-space-border overflow-hidden">
      <Starfield density={40} />
      <div className="container-max relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-blue to-accent-orange flex items-center justify-center">
                <Satellite className="w-5 h-5 text-white" />
              </div>
              <div className="font-mono font-bold text-white">JALNETRA AI</div>
            </div>
            <p className="text-sm text-accent-blue font-mono mb-2">{t('footer.tagline')}</p>
            <p className="text-sm text-gray-400 font-body">{t('footer.line')}</p>
          </div>
          <div>
            <h4 className="text-sm font-mono font-bold text-white mb-3">{t('footer.links')}</h4>
            <ul className="space-y-2">
              {['problem', 'solution', 'map', 'predictor', 'team'].map((id) => (
                <li key={id}>
                  <button onClick={() => onNavigate(id)} className="text-sm text-gray-400 hover:text-accent-blue transition-colors">
                    {t(`nav.${id === 'problem' ? 'problem' : id === 'solution' ? 'solution' : id === 'map' ? 'map' : id === 'predictor' ? 'predictor' : 'team'}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-mono font-bold text-white mb-3">{t('footer.contact')}</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-accent-blue" /> team@jalnetra.ai</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent-blue" /> Andhra Pradesh, India</div>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-space-border text-center space-y-2">
          <p className="text-xs text-gray-500 font-mono">{t('footer.credit')}</p>
          <p className="text-xs text-gray-500 font-mono">{t('footer.team')}</p>
          <p className="text-xs text-gray-600">© 2026 {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
