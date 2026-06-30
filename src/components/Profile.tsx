import { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useAuth, type UserRole } from '../context/AuthContext';
import { useToast } from './Toast';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Save, Sprout } from 'lucide-react';

export default function Profile({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t, formatDate } = useI18n();
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ full_name: '', phone: '', role: '' });
  const [saving, setSaving] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name || '', phone: user.phone || '', role: user.role || 'farmer' });
    }
  }, [user]);

  useEffect(() => {
    if (user && supabase) {
      (async () => {
        const { data } = await supabase.from('predictions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setPredictions(data);
      })();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please sign in to view your profile.</p>
          <button onClick={() => onNavigate('signin')} className="btn-primary">{t('nav.signin')}</button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: form.full_name,
      phone: form.phone,
      role: form.role as UserRole,
    });
    if (error) toast(error, 'error');
    else toast(t('profile.saved'), 'success');
    setSaving(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container-max max-w-3xl">
        <h1 className="text-3xl font-mono font-bold text-white mb-8">{t('profile.title')}</h1>

        {!user.email_confirmed && (
          <div className="glass glass-glow-orange rounded-xl p-4 mb-6 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-accent-orange flex-shrink-0" />
            <p className="text-sm text-gray-300">{t('auth.confirm.banner')}</p>
          </div>
        )}

        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-blue to-accent-orange flex items-center justify-center text-white font-mono font-bold text-2xl">
              {(user.full_name || user.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-mono font-bold text-white">{user.full_name || 'User'}</div>
              <div className="text-sm text-gray-400">{user.email}</div>
              <div className="text-xs text-accent-blue mt-1">{t(`auth.role.${user.role || 'farmer'}`)}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('profile.name')}</label>
              <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white border border-space-border focus:border-accent-blue outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('profile.email')}</label>
              <input type="email" value={user.email} disabled className="w-full px-3 py-2.5 bg-space-bg/30 rounded-lg text-sm text-gray-500 border border-space-border" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('profile.phone')}</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white border border-space-border focus:border-accent-blue outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('profile.role')}</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white border border-space-border focus:border-accent-blue outline-none">
                <option value="farmer">{t('auth.role.farmer')}</option>
                <option value="officer">{t('auth.role.officer')}</option>
                <option value="collector">{t('auth.role.collector')}</option>
                <option value="researcher">{t('auth.role.researcher')}</option>
                <option value="student">{t('auth.role.student')}</option>
              </select>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-50">
              <Save className="w-4 h-4" />
              {t('profile.save')}
            </button>
          </div>
        </div>

        {/* Predictions */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-sm font-mono font-bold text-accent-blue mb-4">{t('profile.predictions')}</h2>
          {predictions.length === 0 ? (
            <div className="text-center py-8">
              <Sprout className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">{t('profile.noPredictions')}</p>
              <button onClick={() => onNavigate('predictor')} className="btn-secondary text-xs mt-3">{t('nav.predictor')}</button>
            </div>
          ) : (
            <div className="space-y-2">
              {predictions.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-space-bg/30">
                  <div>
                    <div className="text-sm text-white font-mono">{p.crop} · {p.district}, {p.state}</div>
                    <div className="text-xs text-gray-500">{formatDate(p.created_at)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-300">Health: {p.health_score}</span>
                    <span className="text-xs font-mono" style={{ color: p.stress_level === 'low' ? '#00C853' : p.stress_level === 'moderate' ? '#FFD600' : '#FF3D00' }}>
                      {p.stress_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
