export default async function handler(_request, response) {
  try {
    const apiResponse = await fetch('http://api.open-notify.org/astros.json');
    const data = await apiResponse.json();

    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    response.status(apiResponse.ok ? 200 : apiResponse.status).json(data);
  } catch (error) {
    response.status(502).json({
      message: 'Unable to fetch people in space.',
    });
  }
}
