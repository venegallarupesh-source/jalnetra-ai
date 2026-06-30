import { useState, useEffect } from 'react';
import { Menu, X, Satellite, User, LogOut, Shield } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { t } = useI18n();
  const { user, signOut, isDemoMode } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { key: 'problem', label: t('nav.problem'), id: 'problem' },
    { key: 'solution', label: t('nav.solution'), id: 'solution' },
    { key: 'map', label: t('nav.map'), id: 'map' },
    { key: 'predictor', label: t('nav.predictor'), id: 'predictor' },
    { key: 'team', label: t('nav.team'), id: 'team' },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-space-card focus:text-white focus:rounded-lg"
      >
        {t('nav.skip')}
      </a>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'py-2 bg-space-bg/90 backdrop-blur-lg border-b border-space-border' : 'py-4'
        }`}
      >
        <div className="container-max px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => handleNav('home')} className="flex items-center gap-2 group" aria-label="JALNETRA AI home">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-blue to-accent-orange flex items-center justify-center group-hover:scale-110 transition-transform">
              <Satellite className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-mono font-bold text-white text-sm leading-none">JALNETRA</div>
              <div className="font-mono text-accent-blue text-[10px] leading-none mt-0.5">AI</div>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.key}
                onClick={() => handleNav(link.id)}
                className={`px-4 py-2 text-sm font-body transition-colors ${
                  currentPage === link.id ? 'text-accent-blue' : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isDemoMode && (
              <span className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-accent-yellow/10 text-accent-yellow text-xs font-mono">
                <Shield className="w-3 h-3" />
                {t('nav.demoMode')}
              </span>
            )}
            <LanguageSwitcher />
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => handleNav('profile')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.full_name || user.email}</span>
                </button>
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg glass text-gray-300 hover:text-accent-red transition-colors"
                  aria-label={t('nav.signout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button onClick={() => handleNav('signin')} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                  {t('nav.signin')}
                </button>
                <button onClick={() => handleNav('signup')} className="btn-primary text-xs px-4 py-2">
                  {t('nav.signup')}
                </button>
              </div>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white"
              aria-label={t('nav.menu')}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden container-max px-4 mt-2 animate-fade-in">
            <div className="glass rounded-xl p-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.key}
                  onClick={() => handleNav(link.id)}
                  className="px-4 py-3 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </button>
              ))}
              {!user && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-space-border">
                  <button onClick={() => handleNav('signin')} className="flex-1 btn-secondary text-xs">
                    {t('nav.signin')}
                  </button>
                  <button onClick={() => handleNav('signup')} className="flex-1 btn-primary text-xs">
                    {t('nav.signup')}
                  </button>
                </div>
              )}
              {user && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-space-border">
                  <button onClick={() => handleNav('profile')} className="flex-1 btn-secondary text-xs">
                    {t('nav.profile')}
                  </button>
                  <button onClick={signOut} className="flex-1 btn-primary text-xs">
                    {t('nav.signout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
