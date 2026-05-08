export const NEWS_CATEGORIES = ['general', 'technology', 'science', 'health', 'entertainment'];

export const CATEGORY_LABELS = {
  general: 'General',
  technology: 'Technology',
  science: 'Science',
  health: 'Health',
  entertainment: 'Entertainment',
};

export function normalizeArticle(article, category) {
  return {
    title: article.title || 'Untitled article',
    source: article.source?.name || 'Unknown source',
    author: article.author || 'Unknown author',
    publishedAt: article.publishedAt || new Date().toISOString(),
    urlToImage: article.urlToImage || '',
    description: article.description || 'No description available.',
    url: article.url || '#',
    category,
  };
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
