import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth, type UserRole } from '../context/AuthContext';
import { useToast } from './Toast';
import { Satellite, Mail, Lock, User, Phone, ArrowLeft, MailCheck, RefreshCw } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'confirm' | 'forgot';

interface AuthPageProps {
  mode: AuthMode;
  onNavigate: (page: string) => void;
}

export default function AuthPage({ mode: initialMode, onNavigate }: AuthPageProps) {
  const { t } = useI18n();
  const { signIn, signUp, resetPassword, resendConfirmation, user, isDemoMode } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '' as UserRole | '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [pendingEmail, setPendingEmail] = useState('');

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // If already signed in, redirect
  useEffect(() => {
    if (user && (mode === 'signin' || mode === 'signup')) {
      if (!user.email_confirmed) {
        setMode('confirm');
        setPendingEmail(user.email);
      } else {
        onNavigate('home');
      }
    }
  }, [user, mode, onNavigate]);

  const passwordStrength = (pwd: string): { score: number; label: string } => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const labels = [t('auth.strength.weak'), t('auth.strength.weak'), t('auth.strength.fair'), t('auth.strength.good'), t('auth.strength.strong')];
    return { score, label: labels[score] };
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === 'signup') {
      if (!form.name.trim()) e.name = t('auth.err.name');
      if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = t('auth.err.phone');
      if (!form.role) e.role = t('auth.err.role');
      if (form.password !== form.confirm) e.confirm = t('auth.err.match');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('auth.err.email');
    if (form.password.length < 8) e.password = t('auth.err.password');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(form.email, form.password);
        if (error) {
          if (error.includes('Invalid login')) toast(t('auth.err.invalid'), 'error');
          else toast(error, 'error');
        } else {
          toast(t('toast.signedIn'), 'success');
        }
      } else if (mode === 'signup') {
        const { error } = await signUp({
          email: form.email,
          password: form.password,
          full_name: form.name,
          phone: form.phone,
          role: form.role as UserRole,
        });
        if (error) {
          if (error.includes('already')) toast(t('auth.err.exists'), 'error');
          else toast(error, 'error');
        } else {
          setPendingEmail(form.email);
          setMode('confirm');
          setResendCountdown(60);
          toast(t('toast.signedUp'), 'success');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(form.email);
        if (error) toast(error, 'error');
        else toast(t('auth.forgot.sent'), 'success');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    const { error } = await resendConfirmation(pendingEmail);
    if (error) toast(error, 'error');
    else {
      toast(t('auth.confirm.subtitle'), 'info');
      setResendCountdown(60);
    }
  };

  if (mode === 'confirm') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
        <div className="glass glass-glow-blue rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-blue/20 flex items-center justify-center animate-float">
            <MailCheck className="w-10 h-10 text-accent-blue" />
          </div>
          <h1 className="text-2xl font-mono font-bold text-white mb-3">{t('auth.confirm.title')}</h1>
          <p className="text-gray-400 mb-2">{t('auth.confirm.subtitle')}</p>
          <p className="text-sm text-accent-blue font-mono mb-6">{pendingEmail}</p>
          <button
            onClick={handleResend}
            disabled={resendCountdown > 0}
            className="btn-secondary text-sm inline-flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            {resendCountdown > 0 ? t('auth.confirm.resendIn', { s: resendCountdown }) : t('auth.confirm.resend')}
          </button>
          <div className="mt-6 pt-6 border-t border-space-border">
            <button onClick={() => onNavigate('home')} className="text-sm text-gray-400 hover:text-white inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('auth.forgot.back')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const strength = passwordStrength(form.password);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
      <div className="glass glass-glow-blue rounded-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent-blue to-accent-orange flex items-center justify-center">
            <Satellite className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-mono font-bold text-white mb-1">
            {mode === 'signin' ? t('auth.signin.title') : mode === 'signup' ? t('auth.signup.title') : t('auth.forgot.title')}
          </h1>
          <p className="text-sm text-gray-400">
            {mode === 'signin' ? t('auth.signin.subtitle') : mode === 'signup' ? t('auth.signup.subtitle') : t('auth.forgot.subtitle')}
          </p>
        </div>

        {isDemoMode && (
          <div className="mb-4 p-3 rounded-lg bg-accent-yellow/10 text-accent-yellow text-xs text-center">
            Demo Mode: Supabase not configured. Auth is simulated.
          </div>
        )}

        <div className="space-y-4">
          {mode === 'signup' && (
            <Field icon={User} label={t('auth.name')} error={errors.name}>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="auth-input" />
            </Field>
          )}
          <Field icon={Mail} label={t('auth.email')} error={errors.email}>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="auth-input" />
          </Field>
          {mode === 'signup' && (
            <Field icon={Phone} label={t('auth.phone')} error={errors.phone}>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" className="auth-input" />
            </Field>
          )}
          {mode === 'signup' && (
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('auth.role')}</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="auth-input">
                <option value="">Select role</option>
                <option value="farmer">{t('auth.role.farmer')}</option>
                <option value="officer">{t('auth.role.officer')}</option>
                <option value="collector">{t('auth.role.collector')}</option>
                <option value="researcher">{t('auth.role.researcher')}</option>
                <option value="student">{t('auth.role.student')}</option>
              </select>
              {errors.role && <p className="text-xs text-accent-red mt-1">{errors.role}</p>}
            </div>
          )}
          {mode !== 'forgot' && (
            <>
              <Field icon={Lock} label={t('auth.password')} error={errors.password}>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="auth-input" />
              </Field>
              {mode === 'signup' && form.password && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength.score ? strength.score <= 1 ? 'bg-accent-red' : strength.score === 2 ? 'bg-accent-yellow' : strength.score === 3 ? 'bg-accent-blue' : 'bg-accent-green' : 'bg-space-border'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{strength.label}</span>
                </div>
              )}
              {mode === 'signup' && (
                <Field icon={Lock} label={t('auth.confirm')} error={errors.confirm}>
                  <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="auth-input" />
                </Field>
              )}
            </>
          )}

          {mode === 'signin' && (
            <button onClick={() => setMode('forgot')} className="text-xs text-accent-blue hover:underline">
              {t('auth.forgot')}
            </button>
          )}

          <button onClick={handleSubmit} disabled={loading} className="w-full btn-primary text-sm disabled:opacity-50">
            {loading ? t('common.loading') : mode === 'signin' ? t('auth.signin.submit') : mode === 'signup' ? t('auth.signup.submit') : t('auth.forgot.submit')}
          </button>

          <div className="text-center text-sm">
            {mode === 'signin' && (
              <button onClick={() => setMode('signup')} className="text-gray-400 hover:text-white">
                {t('auth.signin.switch')}
              </button>
            )}
            {mode === 'signup' && (
              <button onClick={() => setMode('signin')} className="text-gray-400 hover:text-white">
                {t('auth.signup.switch')}
              </button>
            )}
            {mode === 'forgot' && (
              <button onClick={() => setMode('signin')} className="text-gray-400 hover:text-white inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                {t('auth.forgot.back')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, error, children }: { icon: typeof Mail; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-1 block">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <div className="[&>input]:w-full [&>input]:pl-10 [&>input]:pr-3 [&>input]:py-2.5 [&>input]:bg-space-bg/50 [&>input]:rounded-lg [&>input]:text-sm [&>input]:text-white [&>input]:border [&>input]:border-space-border [&>input]:focus:border-accent-blue [&>input]:outline-none [&>select]:w-full [&>select]:pl-10 [&>select]:pr-3 [&>select]:py-2.5 [&>select]:bg-space-bg/50 [&>select]:rounded-lg [&>select]:text-sm [&>select]:text-white [&>select]:border [&>select]:border-space-border [&>select]:focus:border-accent-blue [&>select]:outline-none">
          {children}
        </div>
      </div>
      {error && <p className="text-xs text-accent-red mt-1">{error}</p>}
    </div>
  );
}
