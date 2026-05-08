# ISS & News Intelligence Dashboard

React + Vite dashboard with an ISS tracker, NewsAPI dashboard, Chart.js visualizations, and a Hugging Face powered chatbot restricted to the dashboard data.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Add your keys to `.env`:

```bash
VITE_NEWS_API_KEY=your_newsapi_key_here
VITE_HF_TOKEN=your_huggingface_token_here
```

## Vercel Deployment

1. Push the project to GitHub.
2. Import it in Vercel as a Vite project.
3. Add environment variables in Vercel Project Settings:
   - `VITE_NEWS_API_KEY`
   - `VITE_HF_TOKEN`
4. Deploy. The included `vercel.json` routes SPA paths to `index.html`.

## Notes

- Open Notify API endpoints are HTTP-only, so the deployed app uses Vercel serverless routes in `api/iss-now.js` and `api/astros.js` to avoid browser mixed-content blocking.
- The chatbot intentionally refuses questions outside ISS, people in space, and the currently loaded news articles.
