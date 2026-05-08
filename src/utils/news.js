export const NEWS_CATEGORIES = ['general', 'technology', 'science', 'health', 'entertainment'];

export const CATEGORY_LABELS = {
  general: 'General',
  technology: 'Technology',
  science: 'Science',
  health: 'Health',
  entertainment: 'Entertainment',
};

export const FALLBACK_NEWS_IMAGES = {
  general:
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
  technology:
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  science:
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
  health:
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
  entertainment:
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
};

export function getNewsImage(article) {
  return article.urlToImage || FALLBACK_NEWS_IMAGES[article.category] || FALLBACK_NEWS_IMAGES.general;
}

export function normalizeArticle(article, category) {
  return {
    title: article.title || 'Untitled article',
    source: article.source?.name || 'Unknown source',
    author: article.author || 'Unknown author',
    publishedAt: article.publishedAt || new Date().toISOString(),
    urlToImage: article.urlToImage || FALLBACK_NEWS_IMAGES[category] || FALLBACK_NEWS_IMAGES.general,
    description: cleanArticleText(article.description || 'No description available.'),
    url: article.url || '#',
    category,
  };
}

export function cleanArticleText(value = '') {
  return String(value)
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatDate(value) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return 'Unknown date';
  }
}
