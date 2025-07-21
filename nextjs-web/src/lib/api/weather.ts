import apiClient from './client';
import { WeatherData, ApiResponse } from '@/types';

export const weatherApi = {
  // Get weather for a city
  getWeather: async (city: string = 'Jakarta'): Promise<ApiResponse<WeatherData>> => {
    return apiClient.get(`/weather?city=${encodeURIComponent(city)}`);
  },

  // Get weather for multiple cities
  getMultipleCitiesWeather: async (): Promise<ApiResponse<Record<string, WeatherData>>> => {
    return apiClient.get('/weather/multiple');
  },
};