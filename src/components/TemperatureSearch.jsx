import React, { useState } from "react";

function TemperatureSearch() {
  const [city, setCity] = useState("Bengaluru");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchTemperature = async (cityName = null) => {
    const searchCity = cityName || city;
    
    if (!searchCity.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const response = await fetch(`/api/temperature?city=${encodeURIComponent(searchCity)}`);
      const data = await response.json();
      
      if (response.ok) {
        setWeatherData(data);
      } else {
        throw new Error(data.error || 'Failed to fetch temperature data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickSearch = (cityName) => {
    setCity(cityName);
    searchTemperature(cityName);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">🌡️ Temperature Search</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 font-semibold">Search City Temperature</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name (e.g., Bengaluru, Mumbai, Delhi)"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white mb-3"
          />
          <button
            onClick={() => searchTemperature()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            🔍 Search Temperature
          </button>
          
          <div className="mt-4">
            <p className="text-sm text-gray-400 mb-2">Quick Search:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => quickSearch('Bengaluru')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                🌴 Bengaluru
              </button>
              <button
                onClick={() => quickSearch('Mumbai')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                🏙️ Mumbai
              </button>
              <button
                onClick={() => quickSearch('Delhi')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                🏛️ Delhi
              </button>
              <button
                onClick={() => quickSearch('Chennai')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                🏖️ Chennai
              </button>
            </div>
          </div>
        </div>
        
        <div>
          {loading && (
            <div className="text-center py-8">
              <div className="text-lg mb-2">🔄 Loading temperature data...</div>
              <div className="text-gray-400">Please wait while we fetch the weather information</div>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8 text-red-400">
              <div className="text-lg mb-2">❌ Error</div>
              <div>{error}</div>
            </div>
          )}
          
          {weatherData && !loading && (
            <div className="text-center">
              <div className="text-5xl font-bold mb-2 text-blue-400">
                {weatherData.temperature}°C
              </div>
              <div className="text-lg font-semibold mb-1">
                {weatherData.city}, {weatherData.country}
              </div>
              <div className="text-gray-400 mb-4">
                {weatherData.condition}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-700 p-3 rounded text-center">
                  <div className="text-xs text-gray-400 mb-1">HUMIDITY</div>
                  <div className="text-lg font-bold">{weatherData.humidity}%</div>
                </div>
                <div className="bg-gray-700 p-3 rounded text-center">
                  <div className="text-xs text-gray-400 mb-1">WIND SPEED</div>
                  <div className="text-lg font-bold">{weatherData.wind_speed} km/h</div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                Last updated: {new Date(weatherData.last_updated).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemperatureSearch;

