'use client';

import { useState, useEffect } from 'react';
import { weatherApi } from '@/lib/api/weather';
import { WeatherData } from '@/types';
import { Cloud, Sun, CloudRain, MapPin, Thermometer, Droplets, Wind, RefreshCw } from 'lucide-react';

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchWeather = async (city: string = 'Jakarta') => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await weatherApi.getWeather(city);
      setWeather(response.data);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.error || 'Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    
    // Refresh weather every 30 minutes
    const interval = setInterval(() => fetchWeather(), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (description: string, icon: string) => {
    if (icon) {
      // Use OpenWeather icon
      return (
        <img 
          src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
          alt={description}
          className="h-12 w-12"
        />
      );
    }
    
    // Fallback icons
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('drizzle')) {
      return <CloudRain className="h-8 w-8 text-blue-500" />;
    } else if (desc.includes('cloud')) {
      return <Cloud className="h-8 w-8 text-gray-500" />;
    } else {
      return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <Cloud className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <button
            onClick={() => fetchWeather()}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center mx-auto"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <Cloud className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Weather unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {weather.location}, {weather.country}
          </span>
        </div>
        <button
          onClick={() => fetchWeather()}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
          title="Refresh weather"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Weather Icon & Temperature */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">
              {Math.round(weather.temperature)}°
            </span>
            <span className="text-lg text-gray-500">C</span>
          </div>
          <p className="text-sm text-gray-600 capitalize">{weather.description}</p>
          <p className="text-xs text-gray-500">
            Feels like {Math.round(weather.feels_like)}°C
          </p>
        </div>
        
        <div className="flex flex-col items-center">
          {getWeatherIcon(weather.description, weather.icon)}
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-3 gap-4 text-xs mb-4">
        <div className="text-center">
          <Droplets className="h-4 w-4 text-blue-500 mx-auto mb-1" />
          <p className="text-gray-500">Humidity</p>
          <p className="font-medium text-gray-900">{weather.humidity}%</p>
        </div>
        
        <div className="text-center">
          <Wind className="h-4 w-4 text-gray-500 mx-auto mb-1" />
          <p className="text-gray-500">Wind</p>
          <p className="font-medium text-gray-900">{weather.wind_speed} m/s</p>
        </div>
        
        <div className="text-center">
          <Thermometer className="h-4 w-4 text-red-500 mx-auto mb-1" />
          <p className="text-gray-500">Pressure</p>
          <p className="font-medium text-gray-900">{weather.pressure} hPa</p>
        </div>
      </div>

      {/* Sunrise & Sunset */}
      <div className="grid grid-cols-2 gap-4 text-xs border-t border-gray-100 pt-3">
        <div className="text-center">
          <p className="text-gray-500">Sunrise</p>
          <p className="font-medium text-gray-900">
            {new Date(weather.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Sunset</p>
          <p className="font-medium text-gray-900">
            {new Date(weather.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Unknown'}
        </p>
      </div>
    </div>
  );
}