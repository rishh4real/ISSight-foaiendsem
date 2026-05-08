import { Bot, MessageCircle, Send, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { CATEGORY_LABELS } from '../utils/news';

const REFUSAL =
  'I can only answer questions about the ISS tracker and news articles shown on this dashboard.';

const ALLOWED_KEYWORDS = [
  'iss',
  'space station',
  'latitude',
  'longitude',
  'speed',
  'trajectory',
  'position',
  'where',
  'astronaut',
  'cosmonaut',
  'people in space',
  'news',
  'headline',
  'article',
  'source',
  'author',
  'technology',
  'science',
  'health',
  'entertainment',
  'general',
  'summarize',
  'latest',
  'today',
];

function isAllowedQuestion(message) {
  const normalized = message.toLowerCase();
  return ALLOWED_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function buildDashboardContext({ issData, allArticles, articlesByCategory }) {
  const currentPosition = issData.currentPosition;
  const articleLines = allArticles.slice(0, 25).map((article, index) => {
    return `${index + 1}. [${CATEGORY_LABELS[article.category]}] "${article.title}" from ${article.source}, author: ${article.author}, published: ${article.publishedAt}, description: ${article.description}`;
  });

  const categoryLines = Object.entries(articlesByCategory).map(
    ([category, articles]) => `${CATEGORY_LABELS[category]}: ${articles.length} articles`,
  );

  return `
ISS DATA
Latitude: ${currentPosition ? currentPosition.lat.toFixed(4) : 'unavailable'}
Longitude: ${currentPosition ? currentPosition.lng.toFixed(4) : 'unavailable'}
Current speed: ${currentPosition ? Math.round(currentPosition.speed).toLocaleString() : 'unavailable'} km/h
Nearest place: ${issData.nearestPlace}
Tracked positions: ${issData.trajectory.length}
People in space count: ${issData.peopleCount}
People in space: ${issData.people.map((person) => `${person.name} (${person.craft})`).join(', ') || 'unavailable'}

NEWS CATEGORY COUNTS
${categoryLines.join('\n') || 'No news loaded'}

NEWS ARTICLES
${articleLines.join('\n') || 'No news articles loaded'}
`.trim();
}

function extractGeneratedText(data) {
  if (Array.isArray(data)) return data[0]?.generated_text || data[0]?.summary_text || '';
  return data.generated_text || data.summary_text || data.error || '';
}

export default function Chatbot({ issData, allArticles, articlesByCategory }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useLocalStorage('dashboard-chat-messages', [
    {
      role: 'assistant',
      content: 'Ask me about the ISS tracker, people in space, or the news articles on this dashboard.',
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const panelRef = useRef(null);
  const token = import.meta.env.VITE_HF_TOKEN;

  const context = useMemo(
    () => buildDashboardContext({ issData, allArticles, articlesByCategory }),
    [issData, allArticles, articlesByCategory],
  );

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat cleared. I can answer from the current ISS and news dashboard data.',
      },
    ]);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || typing) return;

    const nextMessages = [...messages, { role: 'user', content: question }].slice(-30);
    setMessages(nextMessages);
    setInput('');

    if (!isAllowedQuestion(question)) {
      setMessages([...nextMessages, { role: 'assistant', content: REFUSAL }].slice(-30));
      return;
    }

    if (!token) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: 'VITE_HF_TOKEN is missing, so I cannot call Hugging Face yet. Add it to .env and restart Vite.',
        },
      ].slice(-30));
      return;
    }

    setTyping(true);
    try {
      const prompt = `
<s>[INST]
System: You are a dashboard assistant. Only use provided data about ISS location, speed, people in space, and news articles. Do not use external knowledge.

If the question cannot be answered using only the dashboard data below, reply exactly:
"${REFUSAL}"

Dashboard data:
${context}

User question: ${question}

Answer in 1-4 concise sentences using only the dashboard data.
[/INST]`;

      const { data } = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 180,
            temperature: 0.2,
            return_full_text: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      const answer = extractGeneratedText(data).trim() || REFUSAL;
      setMessages([...nextMessages, { role: 'assistant', content: answer }].slice(-30));
    } catch (requestError) {
      toast.error('Chatbot request failed.');
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: 'I could not reach Hugging Face right now. Please retry after checking your token or network.',
        },
      ].slice(-30));
    } finally {
      setTyping(false);
      window.setTimeout(() => {
        panelRef.current?.scrollTo({ top: panelRef.current.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[1000] inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600 text-white shadow-xl transition hover:-translate-y-1 hover:bg-cyan-700"
        aria-label={open ? 'Close chatbot' : 'Open chatbot'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open ? (
        <section className="fixed bottom-24 right-5 z-[1000] flex h-[620px] max-h-[calc(100vh-7rem)] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-950 dark:text-white">Dashboard Assistant</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">ISS and news data only</p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearChat}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Clear chat"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </header>

          <div ref={panelRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'ml-auto bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100'
                }`}
              >
                {message.content}
              </div>
            ))}
            {typing ? (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:240ms]" />
              </div>
            ) : null}
          </div>

          <form onSubmit={sendMessage} className="border-t border-slate-200 p-4 dark:border-slate-800">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about ISS or news"
                className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <button
                type="submit"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-600 text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={typing}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </>
  );
}
