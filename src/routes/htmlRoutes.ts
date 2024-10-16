//CHECK ENTIRE FILE FOR ERRORS

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import historyService from '../service/historyService';
import weatherService from '../service/weatherService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

router.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

router.get('/api/weather/history', async (_req, res) => {
    try {
      const cities = await historyService.getCities();
      res.json(cities);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read search history' });
    }
});

router.post('/api/weather', async (req, res) => {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: 'City name is required' });
    }
  
    try {
      await historyService.addCity(city);
      const weatherData = await weatherService.getWeatherForCity(city);
      return res.json(weatherData);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to retrieve weather data' });
    }
  });

export default router;
