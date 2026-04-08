import React, { useEffect, useState } from "react";
import "./Weather.css";

const WeatherDashboard = ({ lat, lon ,name}) => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/weather?lat=${lat}&lon=${lon}`
        );
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  return (
    <div className="weather-card">
      <h3>🌦 Area Weather</h3>

      {weather && (
        <div className="weather-info">
          <p>{name}</p>
          <p className="desc">{weather.description}</p>

          <h1>{weather.temp}°C</h1>

          <div className="details">
            <span>💧 {weather.humidity}%</span>
            <span>🌬 {weather.wind} m/s</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherDashboard;