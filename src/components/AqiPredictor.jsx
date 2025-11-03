import React, { useState } from "react";

function AqiPredictor() {
  const [pm25, setPm25] = useState(15);
  const [pm10, setPm10] = useState(30);
  const [prediction, setPrediction] = useState(null);
  const [aqiCategory, setAqiCategory] = useState(null);

  const predictAqi = () => {
    const calculatedAqi = Math.round(pm25 * 2.5 + pm10 * 0.5);
    setPrediction(calculatedAqi);

    if (calculatedAqi <= 50) {
      setAqiCategory({ category: "Good", color: "bg-green-500" });
    } else if (calculatedAqi <= 100) {
      setAqiCategory({ category: "Moderate", color: "bg-yellow-500" });
    } else if (calculatedAqi <= 150) {
      setAqiCategory({ category: "Unhealthy for Sensitive Groups", color: "bg-orange-500" });
    } else {
      setAqiCategory({ category: "Unhealthy", color: "bg-red-500" });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block mb-2">PM2.5</label>
        <input
          type="number"
          value={pm25}
          onChange={(e) => setPm25(Number(e.target.value))}
          className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white mb-4"
        />
        <label className="block mb-2">PM10</label>
        <input
          type="number"
          value={pm10}
          onChange={(e) => setPm10(Number(e.target.value))}
          className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white mb-4"
        />
        <button
          onClick={predictAqi}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
        >
          Predict AQI
        </button>
      </div>
      <div>
        {prediction !== null && (
          <div className="p-4 rounded bg-gray-800 mt-4">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold ${aqiCategory?.color}`}>
              {prediction}
            </div>
            <div className="text-center text-lg font-semibold">{aqiCategory?.category}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AqiPredictor;