import { ExternalLink, RefreshCw, Search } from 'lucide-react';
import { CATEGORY_LABELS, cleanArticleText, getNewsImage } from '../utils/news';
import { formatDate } from '../utils/news';

function NewsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="skeleton h-40 rounded-lg" />
          <div className="mt-4 skeleton h-5 rounded" />
          <div className="mt-2 skeleton h-4 w-4/5 rounded" />
          <div className="mt-4 skeleton h-9 w-32 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function NewsDashboard({
  categories,
  activeCategory,
  setActiveCategory,
  articles,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  loading,
  error,
  onRefresh,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900 dark:shadow-soft-dark">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white">News Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Top US headlines cached for 15 minutes by category.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search articles"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            aria-label="Sort articles"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="source">Source A-Z</option>
          </select>
          <button
            type="button"
            onClick={() => onRefresh(activeCategory)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => {
          const active = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                active
                  ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <p className="font-semibold">News could not be loaded.</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={() => onRefresh(activeCategory)}
            className="mt-3 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <NewsSkeleton />
      ) : articles.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {articles.map((article) => (
            <article
              key={`${article.title}-${article.publishedAt}`}
              className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/70"
            >
              <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800">
                <img
                  src={getNewsImage(article)}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = getNewsImage({ category: article.category, urlToImage: '' });
                  }}
                />
              </div>
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    {article.source}
                  </span>
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
                <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-snug text-slate-950 dark:text-white">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">By {article.author}</p>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {cleanArticleText(article.description)}
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
                >
                  Read More
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No articles match the current filters.
        </div>
      )}
    </section>
  );
}
