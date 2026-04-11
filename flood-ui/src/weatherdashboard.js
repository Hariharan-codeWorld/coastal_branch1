import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Weather.css";

const WeatherDashboard = ({ lat, lon,name }) => {
  const [weather, setWeather] = useState(null);
  const [rainData, setRainData] = useState([]);

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/weather?lat=${lat}&lon=${lon}`
        );
        const data = await res.json();
        setWeather(data);

        // 🔥 Mock rainfall trend (replace later with real API)
        setRainData([
          { day: "Mon", rain: Math.random() * 10 },
          { day: "Tue", rain: Math.random() * 10 },
          { day: "Wed", rain: Math.random() * 10 },
          { day: "Thu", rain: Math.random() * 10 },
          { day: "Fri", rain: Math.random() * 10 },
        ]);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  return (
    <div className="weather-panel">
      {weather && (
        <>
          {/* Top Section */}
          <div className="weather-top">
            <h2>{name}</h2>
            <p className="desc">{weather.description}</p>

            <h1 className="temp">{weather.temp}°C</h1>
          </div>

          {/* Middle Section */}
          <div className="weather-stats">
            <div>
              <span>💧</span>
              <p>{weather.humidity}%</p>
            </div>
            <div>
              <span>🌬</span>
              <p>{weather.wind} m/s</p>
            </div>
          </div>

          {/* Bottom Chart */}
          <div className="weather-chart">
            <p>Rainfall Trend</p>
            <ResponsiveContainer width="110%" height={120}>
             <LineChart 
  data={rainData}
  margin={{ top: 10, right: 20, left: 20, bottom: 0 }}  // 🔥 add this
>
                <XAxis 
  dataKey="day"
  tick={{ fill: "#0d6efd" }}
  axisLine={false}
  tickLine={false}
  interval={0}   // 🔥 force all days to show
/>
                <Tooltip />
                <Line
  type="monotone"
  dataKey="rain"
  stroke="#2196f3"   // 🔵 blue color
  strokeWidth={2}
/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherDashboard;