import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useToast } from './Toast';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Send, MessageSquare, Smartphone, Check, AlertCircle, User, MapPin, Sprout, Info } from 'lucide-react';

export default function WhatsAppAdvisory({ prediction }: { prediction?: { crop: string; village: string; stressLevel: string; waterDeficit: number; daysToIrrigate: number } }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [form, setForm] = useState({ number: '', name: '', village: '', crop: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Default demo prediction if none passed
  const pred = prediction || { crop: 'Paddy', village: 'West Godavari', stressLevel: 'moderate', waterDeficit: 35, daysToIrrigate: 3 };

  // Build the alert message preview (matches what the edge function sends)
  const alertMessage = `🌾 JALNETRA AI Alert\n\nFarmer: ${form.name || 'Farmer'}\nVillage: ${form.village || pred.village}\nCrop: ${form.crop || pred.crop}\n\n✅ Your crop moisture advisory is ready. Soil moisture and NDVI analysis show your field needs attention. Reply YES to receive irrigation schedule.`;

  const validate = () => {
    const e: Record<string, string> = {};
    const cleaned = form.number.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      e.number = t('wa.invalid');
    }
    if (!form.name.trim()) {
      e.name = t('auth.err.name');
    }
    if (!form.village.trim()) {
      e.village = t('predictor.err.form');
    }
    if (!form.crop.trim()) {
      e.crop = t('predictor.err.form');
    }
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const send = async (channel: 'whatsapp' | 'sms') => {
    if (!validate()) return;
    setSending(true);
    setSent(false);
    setError('');

    try {
      if (isSupabaseConfigured && supabase) {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-advisory`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            number: form.number,
            name: form.name,
            village: form.village,
            crop: form.crop,
            channel,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Request failed (${response.status})`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.simulated) {
          toast(t('wa.demo'), 'info');
        } else {
          toast('✅ WhatsApp alert sent!', 'success');
        }
        setSent(true);
      } else {
        // Demo mode — just show preview
        await new Promise((r) => setTimeout(r, 1000));
        toast(t('wa.demo'), 'info');
        setSent(true);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      toast(t('wa.error'), 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="whatsapp" className="section-pad">
      <div className="container-max">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-mono font-bold text-white mb-3">{t('wa.title')}</h2>
          <p className="text-gray-400 font-body max-w-2xl mx-auto">{t('wa.subtitle')}</p>
          <div className="w-20 h-1 bg-gradient-to-r from-accent-green to-accent-blue mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Form */}
          <div className="glass glass-glow-green rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-accent-green" />
              <h3 className="text-sm font-mono font-bold text-white">{t('wa.title')}</h3>
            </div>
            <div className="space-y-4">
              {/* Farmer Name */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('auth.name')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => { setForm({ ...form, name: e.target.value }); setFieldErrors({ ...fieldErrors, name: '' }); }}
                    placeholder="Farmer name"
                    className="w-full pl-10 pr-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white placeholder-gray-500 border border-space-border focus:border-accent-green outline-none"
                  />
                </div>
                {fieldErrors.name && <p className="text-xs text-accent-red mt-1">{fieldErrors.name}</p>}
              </div>

              {/* Village */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('predictor.form.village')}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={form.village}
                    onChange={(e) => { setForm({ ...form, village: e.target.value }); setFieldErrors({ ...fieldErrors, village: '' }); }}
                    placeholder="Village name"
                    className="w-full pl-10 pr-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white placeholder-gray-500 border border-space-border focus:border-accent-green outline-none"
                  />
                </div>
                {fieldErrors.village && <p className="text-xs text-accent-red mt-1">{fieldErrors.village}</p>}
              </div>

              {/* Crop */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('predictor.form.crop')}</label>
                <div className="relative">
                  <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={form.crop}
                    onChange={(e) => { setForm({ ...form, crop: e.target.value }); setFieldErrors({ ...fieldErrors, crop: '' }); }}
                    placeholder="Crop type (e.g. Paddy, Cotton)"
                    className="w-full pl-10 pr-3 py-2.5 bg-space-bg/50 rounded-lg text-sm text-white placeholder-gray-500 border border-space-border focus:border-accent-green outline-none"
                  />
                </div>
                {fieldErrors.crop && <p className="text-xs text-accent-red mt-1">{fieldErrors.crop}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">{t('wa.number')}</label>
                <div className="flex">
                  <span className="px-3 py-2.5 bg-space-bg/70 rounded-l-lg text-sm text-gray-400 border border-r-0 border-space-border font-mono">+91</span>
                  <input
                    type="tel"
                    value={form.number}
                    onChange={(e) => { setForm({ ...form, number: e.target.value }); setFieldErrors({ ...fieldErrors, number: '' }); }}
                    placeholder={t('wa.number.ph')}
                    className="flex-1 px-3 py-2.5 bg-space-bg/50 rounded-r-lg text-sm text-white placeholder-gray-500 border border-space-border focus:border-accent-green outline-none"
                  />
                </div>
                {fieldErrors.number && <p className="text-xs text-accent-red mt-1">{fieldErrors.number}</p>}
              </div>

              {/* Sandbox note */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-yellow/10 border border-accent-yellow/30">
                <Info className="w-4 h-4 text-accent-yellow flex-shrink-0 mt-0.5" />
                <p className="text-xs text-accent-yellow leading-relaxed">
                  Note: Recipient must first send the join code to +1 415 523 8886 on WhatsApp to receive messages (Twilio sandbox limitation).
                </p>
              </div>

              {/* Send buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => send('whatsapp')}
                  disabled={sending}
                  className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #00C853 0%, #00BFFF 100%)' }}
                >
                  <Send className="w-4 h-4" />
                  {sending ? t('wa.sending') : 'Send WhatsApp Alert'}
                </button>
                <button onClick={() => send('sms')} disabled={sending} className="btn-secondary text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  {t('wa.sms')}
                </button>
              </div>

              {/* Success message */}
              {sent && !error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-green/10 text-accent-green text-sm animate-fade-in">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>✅ WhatsApp alert sent!</span>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-red/10 text-accent-red text-sm animate-fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message preview */}
          <div className="glass rounded-2xl p-6">
            <div className="text-xs font-mono text-gray-400 mb-3">{t('wa.preview')}</div>
            <div className="bg-[#0a1f12] rounded-xl p-4 border border-accent-green/20">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-accent-green" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-accent-green font-mono mb-1">JALNETRA AI</div>
                  <div className="bg-space-card rounded-lg p-3 text-sm text-gray-200 whitespace-pre-line">
                    {alertMessage}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right">12:00 PM</div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">{t('wa.demo')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
