import { useEffect } from 'react';
import Chatbot from './components/Chatbot';
import ISSTracker from './components/ISSTracker';
import NewsChart from './components/NewsChart';
import NewsDashboard from './components/NewsDashboard';
import SpeedChart from './components/SpeedChart';
import ThemeToggle from './components/ThemeToggle';
import Toast from './components/Toast';
import { useISSData } from './hooks/useISSData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNews } from './hooks/useNews';

export default function App() {
  const [theme, setTheme] = useLocalStorage('dashboard-theme', 'dark');
  const issData = useISSData();
  const newsData = useNews();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Toast />
      <header className="sticky top-0 z-[900] border-b border-slate-200 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600 dark:text-cyan-300">
              Space + Signals
            </p>
            <h1 className="mt-1 text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
              ISS & News Intelligence Dashboard
            </h1>
          </div>
          <ThemeToggle
            theme={theme}
            onToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <ISSTracker
          currentPosition={issData.currentPosition}
          trajectory={issData.trajectory}
          nearestPlace={issData.nearestPlace}
          speedHistory={issData.speedHistory}
          people={issData.people}
          peopleCount={issData.peopleCount}
          peopleLoading={issData.peopleLoading}
          loading={issData.loading}
          error={issData.error}
          onRefresh={issData.refreshAll}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <SpeedChart speedHistory={issData.speedHistory} />
          <NewsChart articleCounts={newsData.articleCounts} onSelectCategory={newsData.setActiveCategory} />
        </div>

        <NewsDashboard
          categories={newsData.categories}
          activeCategory={newsData.activeCategory}
          setActiveCategory={newsData.setActiveCategory}
          articles={newsData.articles}
          searchTerm={newsData.searchTerm}
          setSearchTerm={newsData.setSearchTerm}
          sortBy={newsData.sortBy}
          setSortBy={newsData.setSortBy}
          loading={newsData.loading}
          error={newsData.error}
          onRefresh={newsData.fetchCategory}
        />
      </main>

      <Chatbot
        issData={issData}
        allArticles={newsData.allArticles}
        articlesByCategory={newsData.articlesByCategory}
      />
    </div>
  );
}
