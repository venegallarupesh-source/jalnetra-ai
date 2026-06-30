import { Satellite, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import Starfield from './Starfield';
import { useInView, useCountUp } from '../hooks/useReveal';

interface HeroProps {
  onNavigate: (page: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const { t } = useI18n();
  const { ref, inView } = useInView<HTMLDivElement>(0.2);

  const stats = [
    { value: 73000, prefix: '₹', suffix: ' Cr', label: t('hero.stat1.label'), key: 'hero.stat1.value' },
    { value: 78, suffix: '%', label: t('hero.stat2.label'), key: 'hero.stat2.value' },
    { value: 14, suffix: '', label: t('hero.stat3.label'), key: 'hero.stat3.value' },
    { value: 94, suffix: '%', label: t('hero.stat4.label'), key: 'hero.stat4.value' },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <Starfield density={120} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-space-bg pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-orange/10 rounded-full blur-[120px] pointer-events-none" />

      <div ref={ref} className="container-max px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass glass-glow-blue mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
          <span className="text-xs font-mono text-gray-300">{t('hero.badge')}</span>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-mono font-bold mb-4 animate-slide-up">
          <span className="text-white">{t('hero.title1')}</span>
          <span className="text-gradient ml-2">{t('hero.title2')}</span>
        </h1>

        <p className="text-xl sm:text-2xl text-accent-blue font-mono mb-3 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
          {t('hero.tagline')}
        </p>

        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 font-body animate-slide-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
          <button onClick={() => onNavigate('map')} className="btn-primary inline-flex items-center gap-2 group">
            <Satellite className="w-4 h-4" />
            {t('hero.cta.explore')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => onNavigate('predictor')} className="btn-secondary inline-flex items-center gap-2">
            {t('hero.cta.predict')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} start={inView} delay={i * 200} />
          ))}
        </div>
      </div>

      <button
        onClick={() => onNavigate('problem')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 hover:text-accent-blue transition-colors animate-bounce"
        aria-label={t('hero.scroll')}
      >
        <ChevronDown className="w-6 h-6" />
      </button>
    </section>
  );
}

function StatCard({ stat, start, delay }: { stat: { value: number; prefix?: string; suffix?: string; label: string }; start: boolean; delay: number }) {
  const count = useCountUp(stat.value, 2000, start);
  const display = `${stat.prefix || ''}${Math.round(count).toLocaleString('en-IN')}${stat.suffix || ''}`;

  return (
    <div
      className="glass rounded-xl p-4 text-center card-hover"
      style={{ opacity: 0, animation: start ? 'slideUp 0.7s forwards' : 'none', animationDelay: `${delay}ms` }}
    >
      <div className="text-2xl sm:text-3xl font-mono font-bold text-gradient mb-1">{display}</div>
      <div className="text-xs text-gray-400 font-body leading-tight">{stat.label}</div>
    </div>
  );
}
