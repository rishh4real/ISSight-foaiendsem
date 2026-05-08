import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { NEWS_CATEGORIES, normalizeArticle } from '../utils/news';

const CACHE_KEY = 'dashboard-news-cache-v1';
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCachedNews() {
  try {
    const cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) || '{}');
    if (!cached.timestamp || Date.now() - cached.timestamp > CACHE_TTL_MS) return null;
    return cached.articlesByCategory || null;
  } catch {
    return null;
  }
}

function setCachedNews(articlesByCategory) {
  window.localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      articlesByCategory,
    }),
  );
}

export function useNews() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [articlesByCategory, setArticlesByCategory] = useState(() => getCachedNews() || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loadingCategories, setLoadingCategories] = useState({});
  const [errors, setErrors] = useState({});
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;

  const fetchCategory = useCallback(
    async (category, { silent = false } = {}) => {
      if (!apiKey) {
        setErrors((current) => ({
          ...current,
          [category]: 'Missing VITE_NEWS_API_KEY. Add it to your .env file.',
        }));
        return;
      }

      setLoadingCategories((current) => ({ ...current, [category]: true }));
      setErrors((current) => ({ ...current, [category]: '' }));

      try {
        const { data } = await axios.get('https://newsapi.org/v2/top-headlines', {
          params: {
            country: 'us',
            category,
            pageSize: 10,
            apiKey,
          },
          timeout: 15000,
        });

        const articles = (data.articles || []).slice(0, 10).map((article) => normalizeArticle(article, category));
        setArticlesByCategory((current) => {
          const next = { ...current, [category]: articles };
          setCachedNews(next);
          return next;
        });
        if (!silent) toast.success(`${category} news refreshed.`);
      } catch (requestError) {
        setErrors((current) => ({
          ...current,
          [category]: requestError.response?.data?.message || 'Could not fetch news. Please retry.',
        }));
        if (!silent) toast.error('Unable to fetch news.');
      } finally {
        setLoadingCategories((current) => ({ ...current, [category]: false }));
      }
    },
    [apiKey],
  );

  const fetchAllCategories = useCallback(async () => {
    await Promise.all(NEWS_CATEGORIES.map((category) => fetchCategory(category, { silent: true })));
  }, [fetchCategory]);

  useEffect(() => {
    const cached = getCachedNews();
    if (cached) return;
    fetchAllCategories();
  }, [fetchAllCategories]);

  const activeArticles = articlesByCategory[activeCategory] || [];

  const filteredArticles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filtered = query
      ? activeArticles.filter((article) =>
          [article.title, article.description, article.source, article.author]
            .join(' ')
            .toLowerCase()
            .includes(query),
        )
      : activeArticles;

    return [...filtered].sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.publishedAt) - new Date(b.publishedAt);
      if (sortBy === 'source') return a.source.localeCompare(b.source);
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });
  }, [activeArticles, searchTerm, sortBy]);

  const articleCounts = useMemo(
    () =>
      NEWS_CATEGORIES.reduce((counts, category) => {
        counts[category] = articlesByCategory[category]?.length || 0;
        return counts;
      }, {}),
    [articlesByCategory],
  );

  const allArticles = useMemo(
    () => NEWS_CATEGORIES.flatMap((category) => articlesByCategory[category] || []),
    [articlesByCategory],
  );

  return {
    activeCategory,
    setActiveCategory,
    categories: NEWS_CATEGORIES,
    articles: filteredArticles,
    allArticles,
    articlesByCategory,
    articleCounts,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    loading: Boolean(loadingCategories[activeCategory]),
    errors,
    error: errors[activeCategory],
    fetchCategory,
    fetchAllCategories,
  };
}
