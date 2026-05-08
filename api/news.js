const ALLOWED_CATEGORIES = new Set(['general', 'technology', 'science', 'health', 'entertainment']);
const RSS_TOPICS = {
  general: 'WORLD',
  technology: 'TECHNOLOGY',
  science: 'SCIENCE',
  health: 'HEALTH',
  entertainment: 'ENTERTAINMENT',
};

function decodeHtml(value = '') {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readTag(item, tagName) {
  const match = item.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));
  return decodeHtml(match?.[1] || '');
}

function normalizeGNewsArticle(article) {
  return {
    title: article.title,
    source: {
      name: article.source?.name || 'GNews',
    },
    author: article.source?.name || 'Unknown author',
    publishedAt: article.publishedAt,
    urlToImage: article.image,
    description: article.description || article.content || 'No description available.',
    url: article.url,
  };
}

async function fetchGNews(category, apiKey) {
  const url = new URL('https://gnews.io/api/v4/top-headlines');
  url.searchParams.set('category', category);
  url.searchParams.set('lang', 'en');
  url.searchParams.set('country', 'us');
  url.searchParams.set('max', '10');
  url.searchParams.set('apikey', apiKey);

  const apiResponse = await fetch(url);
  const data = await apiResponse.json();

  return {
    ok: apiResponse.ok,
    status: apiResponse.status,
    data: apiResponse.ok
      ? {
          status: 'ok',
          totalResults: data.totalArticles || data.articles?.length || 0,
          articles: (data.articles || []).map(normalizeGNewsArticle),
        }
      : data,
  };
}

async function fetchNewsApi(category, apiKey) {
  const url = new URL('https://newsapi.org/v2/top-headlines');
  url.searchParams.set('country', 'us');
  url.searchParams.set('category', category);
  url.searchParams.set('pageSize', '10');
  url.searchParams.set('apiKey', apiKey);

  const apiResponse = await fetch(url);
  const data = await apiResponse.json();

  return {
    ok: apiResponse.ok,
    status: apiResponse.status,
    data,
  };
}

async function fetchGoogleNewsRss(category) {
  const topic = RSS_TOPICS[category] || RSS_TOPICS.general;
  const url = `https://news.google.com/rss/headlines/section/topic/${topic}?hl=en-US&gl=US&ceid=US:en`;
  const apiResponse = await fetch(url, {
    headers: {
      'User-Agent': 'ISSight Dashboard/1.0',
    },
  });
  const xml = await apiResponse.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 10);
  const articles = items.map((match) => {
    const item = match[1];
    const title = readTag(item, 'title');
    const source = readTag(item, 'source') || 'Google News';

    return {
      title,
      source: {
        name: source,
      },
      author: source,
      publishedAt: new Date(readTag(item, 'pubDate') || Date.now()).toISOString(),
      urlToImage: '',
      description: readTag(item, 'description') || title,
      url: readTag(item, 'link'),
    };
  });

  return {
    ok: apiResponse.ok && articles.length > 0,
    status: apiResponse.ok ? 200 : apiResponse.status,
    data: {
      status: 'ok',
      provider: 'google-news-rss-fallback',
      totalResults: articles.length,
      articles,
    },
  };
}

export default async function handler(request, response) {
  const gnewsApiKey = process.env.GNEWS_API_KEY || process.env.VITE_GNEWS_API_KEY;
  const newsApiKey = process.env.NEWS_API_KEY || process.env.VITE_NEWS_API_KEY;
  const category = ALLOWED_CATEGORIES.has(request.query.category) ? request.query.category : 'general';

  try {
    const attempts = [];

    if (gnewsApiKey) attempts.push(() => fetchGNews(category, gnewsApiKey));
    if (newsApiKey) attempts.push(() => fetchNewsApi(category, newsApiKey));
    attempts.push(() => fetchGoogleNewsRss(category));

    let lastResult;
    for (const attempt of attempts) {
      lastResult = await attempt();
      if (lastResult.ok) break;
    }

    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    response.status(lastResult.ok ? 200 : lastResult.status).json(lastResult.data);
  } catch (error) {
    response.status(502).json({
      message: 'Unable to fetch news right now.',
    });
  }
}
