import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { MessageSquare, X, Send, Minus, Sparkles } from 'lucide-react';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

// Knowledge base — keyword-matched responses
const KB: { keywords: string[]; response: string }[] = [
  {
    keywords: ['satellite', 'source', 'data', 'sentinel', 'eos', 'nisar'],
    response: 'We use Sentinel-2 (optical, 10m, 5-day revisit), EOS-04 RISAT (SAR, all-weather), and are NISAR-ready for ISRO-NASA\'s 2025+ mission at 12m resolution. All data is open or ISRO-licensed.',
  },
  {
    keywords: ['model', 'ai', 'ml', 'convlstm', 'unet', 'random forest', 'fao'],
    response: 'Our AI stack: ConvLSTM for spatio-temporal stress detection, Attention U-Net for segmentation, Random Forest (200 trees) for crop classification, and FAO-56 dual crop coefficient for water deficit. SHAP for explainability.',
  },
  {
    keywords: ['accurate', 'accuracy', 'f1', 'correct', 'reliable'],
    response: '94% accuracy (F1: 0.89) on held-out test fields, with 95% correlation to ground-truth soil moisture readings. Every prediction includes a 90-96% confidence score.',
  },
  {
    keywords: ['cost', 'price', 'farmer', 'afford', 'free', 'cheap'],
    response: '₹50-200 per farmer per season, often government-subsidized to free. The farmer only needs a basic phone that can receive WhatsApp or SMS — no smartphone app, no sensor, no internet required.',
  },
  {
    keywords: ['whatsapp', 'sms', 'message', 'deliver', 'phone'],
    response: 'Advisory is delivered via WhatsApp or SMS in 6 regional languages. The farmer receives a message like: "JALNETRA AI Advisory — Paddy in West Godavari: Stress level Moderate, Water deficit 35mm. Irrigate within 3 days." No app or internet needed.',
  },
  {
    keywords: ['team', 'who', 'rupesh', 'hema', 'saharsh', 'built', 'developer'],
    response: 'Built by 3 engineers: Venegalla Rupesh (Team Leader, AI/ML & Systems), Hema Sundhar Rao Pedada (Remote Sensing & Data Pipeline), and Saharsh Chowdary Narra (Full-Stack & Delivery).',
  },
  {
    keywords: ['dataset', 'data source', 'ground truth', 'training'],
    response: 'Training data: 50+ districts across AP, Telangana, Maharashtra, Punjab, UP. Ground truth from ICRISAT field surveys and IMD weather stations. 2 cropping seasons of validation.',
  },
  {
    keywords: ['30', 'hour', 'plan', 'hackathon', 'timeline', 'phase'],
    response: '30-hour plan: 0-4h ideation, 4-10h data pipeline, 10-18h AI models, 18-23h delivery layer, 23-27h integration & testing, 27-30h demo & pitch.',
  },
  {
    keywords: ['competitor', 'fasal', 'satsure', 'nasa', 'comparison', 'better'],
    response: 'vs ISRO FASAL: field-level (not district), WhatsApp delivery. vs SatSure: affordable for small farmers. vs NASA Harvest: SAR all-weather, 6 regional languages, explainable AI.',
  },
  {
    keywords: ['language', 'telugu', 'hindi', 'tamil', 'kannada', 'bengali'],
    response: 'Available in 6 languages: English, Telugu, Hindi, Tamil, Kannada, and Bengali. Every UI string, advisory message, and WhatsApp template is translated. Switch from the navbar.',
  },
  {
    keywords: ['water', 'stress', 'moisture', 'irrigation', 'deficit'],
    response: 'We detect water stress using NDVI, NDWI, and SAR-derived soil moisture, then compute FAO-56 water deficit (mm) and recommend an irrigation date. Stress is classified as Low (<30%), Moderate (30-60%), or High (>60%).',
  },
  {
    keywords: ['hello', 'hi', 'hey', 'start'],
    response: 'Hi! I\'m the JALNETRA AI assistant. Ask me about our satellite data, AI models, accuracy, WhatsApp system, cost, or the team.',
  },
];

export default function Chatbot() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'bot', text: t('chat.greeting') }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    if (!open) setUnread(true);
  }, [messages]);

  const quickReplies = [
    { key: 'chat.quick.sources', text: t('chat.quick.sources') },
    { key: 'chat.quick.models', text: t('chat.quick.models') },
    { key: 'chat.quick.accuracy', text: t('chat.quick.accuracy') },
    { key: 'chat.quick.cost', text: t('chat.quick.cost') },
    { key: 'chat.quick.whatsapp', text: t('chat.quick.whatsapp') },
    { key: 'chat.quick.team', text: t('chat.quick.team') },
  ];

  const findResponse = (query: string): string => {
    const lower = query.toLowerCase();
    for (const entry of KB) {
      if (entry.keywords.some((k) => lower.includes(k))) {
        return entry.response;
      }
    }
    return 'I can help with: satellite sources, AI models, accuracy, cost to farmer, WhatsApp delivery, the team, datasets, the 30-hour plan, or competitive comparison. Try asking about any of these!';
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const response = findResponse(text);
      setTyping(false);
      setMessages((prev) => [...prev, { role: 'bot', text: response }]);
    }, 800 + Math.random() * 500);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setUnread(false); }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-accent-blue to-accent-orange flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label={t('chat.title')}
        >
          <MessageSquare className="w-6 h-6 text-white" />
          {unread && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-red flex items-center justify-center text-xs text-white font-bold">
              1
            </span>
          )}
          <span className="absolute inset-0 rounded-full animate-ping bg-accent-blue/30" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 glass rounded-2xl overflow-hidden flex flex-col" style={{ height: minimized ? 'auto' : '500px' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-space-card/80 border-b border-space-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-orange flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-mono font-bold text-white">{t('chat.title')}</div>
                <div className="text-xs text-accent-green flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                  Online
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(!minimized)} className="p-1.5 text-gray-400 hover:text-white" aria-label={minimized ? t('chat.expand') : t('chat.minimize')}>
                <Minus className="w-4 h-4" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 text-gray-400 hover:text-white" aria-label={t('chat.close')}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-accent-blue/20 text-white' : 'bg-space-card text-gray-200'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-space-card p-3 rounded-xl">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick replies */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                  {quickReplies.map((q) => (
                    <button
                      key={q.key}
                      onClick={() => send(q.text)}
                      className="px-2.5 py-1.5 rounded-full bg-accent-blue/10 text-accent-blue text-xs hover:bg-accent-blue/20 transition-colors"
                    >
                      {q.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-space-border flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send(input)}
                  placeholder={t('chat.placeholder')}
                  className="flex-1 px-3 py-2 bg-space-bg/50 rounded-lg text-sm text-white placeholder-gray-500 border border-space-border focus:border-accent-blue outline-none"
                  aria-label={t('chat.placeholder')}
                />
                <button onClick={() => send(input)} className="p-2 rounded-lg bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30 transition-colors" aria-label={t('chat.send')}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
