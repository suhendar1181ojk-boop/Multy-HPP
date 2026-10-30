import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Bot, 
  User, 
  X, 
  AlertCircle, 
  Check, 
  Copy,
  Lightbulb,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { ProjectData, CalculationResult, formatIDR } from '../utils/calculations';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

interface AIConsultantChatProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
  calculationResult: CalculationResult;
  language: 'id' | 'en';
}

const QUICK_PROMPTS = [
  '💡 Berikan 3 saran efisiensi biaya paling konkret tanpa mengurangi kualitas',
  '🔍 Apakah target margin ini realistis dan kompetitif di pasaran?',
  '⚠️ Deteksi risiko biaya tersembunyi (hidden costs) yang belum saya hitung',
  '📉 Bagaimana strategi menekan titik impas (BEP) agar lebih cepat balik modal?',
  '💼 Susun rekomendasi syarat pembayaran (DP & termin) yang aman untuk cash flow',
];

export const AIConsultantChat: React.FC<AIConsultantChatProps> = ({
  isOpen,
  onClose,
  project,
  calculationResult,
  language,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Halo! Saya Konsultan Keuangan & Analis Biaya HPP-Pro Master.

Saya telah menganalisis data proyek **"${project.name || 'Proyek Anda'}"**:
- **HPP per Satuan:** ${formatIDR(calculationResult.costPerUnit)}
- **Harga Jual Rekomendasi:** ${formatIDR(calculationResult.suggestedPriceNet)} (Margin ${calculationResult.effectiveMarginPercent.toFixed(1)}%)
- **Titik Impas (BEP):** ${calculationResult.bepUnits} ${project.volumeUnit}

Ada yang ingin didiskusikan untuk optimasi biaya atau strategi penetapan harga?`,
      timestamp: Date.now(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, text: m.text })),
          context: {
            projectName: project.name,
            category: project.category,
            productionVolume: project.productionVolume,
            volumeUnit: project.volumeUnit,
            targetMargin: project.targetMargin,
            totalMaterial: calculationResult.totalMaterial,
            totalLabor: calculationResult.totalLabor,
            totalOverhead: calculationResult.totalOverhead,
            contingencyAmount: calculationResult.contingencyAmount,
            contingencyPercent: project.contingencyPercent,
            totalCost: calculationResult.totalCost,
            costPerUnit: calculationResult.costPerUnit,
            sellingPrice: calculationResult.suggestedPriceNet,
            profitPerUnit: calculationResult.profitPerUnit,
            bepUnits: calculationResult.bepUnits,
            bepRevenue: calculationResult.bepRevenue,
            items: project.items,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghubungi asisten AI.');
      }

      const botMsg: Message = {
        id: 'msg_bot_' + Date.now(),
        role: 'assistant',
        text: data.reply || 'Maaf, saya tidak dapat merespons saat ini.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan pada layanan AI.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format basic markdown tables and text
  const renderMessageContent = (text: string) => {
    // If it contains markdown tables or bullets, we format it cleanly
    const lines = text.split('\n');
    return (
      <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-white text-sm mt-2 mb-1">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-extrabold text-sky-300 text-base mt-3 mb-1">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-slate-300">
                {line.substring(2)}
              </li>
            );
          }
          if (line.startsWith('|')) {
            // Simple table row
            return (
              <div key={idx} className="font-mono text-[11px] bg-slate-950/80 px-2 py-0.5 rounded text-sky-200 overflow-x-auto whitespace-pre">
                {line}
              </div>
            );
          }
          return (
            <p key={idx} className={line.trim() === '' ? 'h-2' : 'text-slate-200'}>
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-[#0b1329] border border-slate-800 rounded-2xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Konsultan Biaya AI Pro</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400">
                Konteks aktif: {project.name || 'Proyek'} (HPP: {formatIDR(calculationResult.costPerUnit)})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-2.5 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" />
            Tanya Cepat:
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 border border-slate-800 hover:border-sky-500/40 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages List Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600/80 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 rounded-tl-none'
                  }`}
                >
                  {renderMessageContent(msg.text)}
                  <span className="text-[10px] text-slate-400/80 mt-1 block text-right font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-lg bg-blue-600/80 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-sky-300 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Konsultan AI sedang menganalisis struktur biaya Anda...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ketik pertanyaan seputar HPP, RAB, atau strategi margin..."
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
