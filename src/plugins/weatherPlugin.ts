// src/plugins/weatherPlugin.ts
// Returns mock weather info for a city in the query
import { config } from 'dotenv';
import { Plugin } from './pluginInterface';
import axios from 'axios';

config();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE = 'http://api.weatherapi.com/v1/current.json';

const WeatherPlugin: Plugin = {
  name: 'WeatherPlugin',
  description: 'Returns real weather info using WeatherAPI.com if query contains "weather in <city>"',
  canHandle(query: string) {
    return /weather in ([a-zA-Z\s]+)/i.test(query);
  },
  async handle(query: string) {
    const match = query.match(/weather in ([a-zA-Z\s]+)/i);
    if (!match) return 'Could not find city.';
    const city = match[1].trim();
    if (!WEATHER_API_KEY) return 'Weather API key not set.';
    try {
      const url = `${WEATHER_API_BASE}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}`;
      const response = await axios.get(url);
      const data: any = response.data;
      if (!data || typeof data !== 'object' || !('current' in data) || !('location' in data)) return 'Weather data not found.';
      return `Weather in ${data.location.name}, ${data.location.country}: ${data.current.condition.text}, ${data.current.temp_c}°C, Humidity: ${data.current.humidity}%, Wind: ${data.current.wind_kph} kph.`;
    } catch (e) {
      return 'Failed to fetch weather data.';
    }
  },
};

export default WeatherPlugin;
