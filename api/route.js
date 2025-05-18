export default async function handler(req, res) {
  const { path } = req.query; // Получаем параметры пути
  const osrmUrl = `http://router.project-osrm.org/route/${path}`;

  try {
    const response = await fetch(osrmUrl, {
      headers: {
        'User-Agent': 'AptosTrip/1.0 (Contact: your-email@example.com)',
        'Accept': 'application/json',
      },
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch route from OSRM', details: error.message });
  }
}