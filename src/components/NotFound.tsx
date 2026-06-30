import { Satellite, Home } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import Starfield from './Starfield';

export default function NotFound({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <Starfield density={60} />
      <div className="text-center relative z-10 px-4">
        <div className="text-8xl sm:text-9xl font-mono font-bold text-gradient mb-4">404</div>
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent-blue/20 flex items-center justify-center animate-float">
          <Satellite className="w-8 h-8 text-accent-blue" />
        </div>
        <h1 className="text-2xl font-mono font-bold text-white mb-2">{t('404.title')}</h1>
        <p className="text-gray-400 mb-8">{t('404.subtitle')}</p>
        <button onClick={() => onNavigate('home')} className="btn-primary inline-flex items-center gap-2">
          <Home className="w-4 h-4" />
          {t('404.home')}
        </button>
      </div>
    </div>
  );
}
