const ALLOWED_CATEGORIES = new Set(['general', 'technology', 'science', 'health', 'entertainment']);

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

export default async function handler(request, response) {
  const gnewsApiKey = process.env.GNEWS_API_KEY || process.env.VITE_GNEWS_API_KEY;
  const newsApiKey = process.env.NEWS_API_KEY || process.env.VITE_NEWS_API_KEY;
  const category = ALLOWED_CATEGORIES.has(request.query.category) ? request.query.category : 'general';

  if (!gnewsApiKey && !newsApiKey) {
    response.status(500).json({
      message: 'Missing GNEWS_API_KEY or NEWS_API_KEY in Vercel environment variables.',
    });
    return;
  }

  try {
    const result = gnewsApiKey
      ? await fetchGNews(category, gnewsApiKey)
      : await fetchNewsApi(category, newsApiKey);

    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    response.status(result.ok ? 200 : result.status).json(result.data);
  } catch (error) {
    response.status(502).json({
      message: 'Unable to fetch news right now.',
    });
  }
}
