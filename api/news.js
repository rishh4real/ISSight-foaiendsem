const ALLOWED_CATEGORIES = new Set(['general', 'technology', 'science', 'health', 'entertainment']);

export default async function handler(request, response) {
  const apiKey = process.env.NEWS_API_KEY || process.env.VITE_NEWS_API_KEY;
  const category = ALLOWED_CATEGORIES.has(request.query.category) ? request.query.category : 'general';

  if (!apiKey) {
    response.status(500).json({
      message: 'Missing NEWS_API_KEY or VITE_NEWS_API_KEY in Vercel environment variables.',
    });
    return;
  }

  try {
    const url = new URL('https://newsapi.org/v2/top-headlines');
    url.searchParams.set('country', 'us');
    url.searchParams.set('category', category);
    url.searchParams.set('pageSize', '10');
    url.searchParams.set('apiKey', apiKey);

    const apiResponse = await fetch(url);
    const data = await apiResponse.json();

    response.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    response.status(apiResponse.ok ? 200 : apiResponse.status).json(data);
  } catch (error) {
    response.status(502).json({
      message: 'Unable to fetch news right now.',
    });
  }
}
