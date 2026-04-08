import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

import "leaflet/dist/leaflet.css";
import "./App.css"; // New CSS with futuristic design

function App() {
  const [areas, setAreas] = useState([]);
  const [area, setArea] = useState("");
  const [risk, setRisk] = useState("");
  const [finalRisk, setFinalRisk] = useState("");
  const [loading, setLoading] = useState(false);
  const [rainfallData, setRainfallData] = useState([]);

  // 🔹 Canvas background ref
  useEffect(() => {
  const canvas = document.createElement("canvas");
  canvas.id = "water-canvas";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const waves = [];
  const waveCount = 3; // number of overlapping waves

  for (let i = 0; i < waveCount; i++) {
    waves.push({
      amplitude: 10 + Math.random() * 10, // wave height
      wavelength: 100 + Math.random() * 100, // distance between peaks
      speed: 0.02 + Math.random() * 0.02, // speed
      phase: Math.random() * 2 * Math.PI,
      yOffset: height / 2 + (Math.random() - 0.5) * 50
    });
  }

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    // light blue background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#e0f7fa");
    gradient.addColorStop(1, "#b2ebf2");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // draw waves
    waves.forEach(wave => {
      ctx.beginPath();
      for (let x = 0; x < width; x += 1) {
        const y =
          wave.yOffset +
          wave.amplitude * Math.sin((x / wave.wavelength) * 2 * Math.PI + wave.phase);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(21, 101, 192, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      wave.phase += wave.speed; // animate wave
    });

    requestAnimationFrame(draw);
  };

  draw();

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
    document.body.removeChild(canvas);
  };
}, []);

  // 🔹 Fetch areas
  useEffect(() => {
    fetch("http://localhost:3001/areas")
      .then(res => res.json())
      .then(data => {
        setAreas(data);
        if (data.length > 0) setArea(data[0].name);
      });
  }, []);

  // 🔹 Fetch risk and rainfall
  useEffect(() => {
    if (!area) return;
    setLoading(true);
    setRisk("");
    setFinalRisk("");

    fetch(`http://localhost:3001/risk?area=${area}`)
      .then(res => res.json())
      .then(data => {
        setRisk(data.risk);

        const selectedArea = areas.find(a => a.name === area);
        if (selectedArea) updateFinalRisk(data.risk, selectedArea.sensitivity);

        // Dynamic rainfall data
        setRainfallData([
          { day: "Mon", rain: Math.floor(Math.random() * 10) },
          { day: "Tue", rain: Math.floor(Math.random() * 10) },
          { day: "Wed", rain: Math.floor(Math.random() * 10) },
          { day: "Thu", rain: Math.floor(Math.random() * 10) },
          { day: "Fri", rain: Math.floor(Math.random() * 10) },
        ]);

        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setRisk("Error");
        setLoading(false);
      });
  }, [area, areas]);

  // 🔹 Risk logic
  const updateFinalRisk = (modelRisk, areaSensitivity) => {
    let result = modelRisk;
    if (modelRisk === "Low" && areaSensitivity === "High") result = "Medium";
    if (modelRisk === "Medium" && areaSensitivity === "High") result = "High";
    setFinalRisk(result);
  };

  const getColor = (risk) => {
    if (risk === "High") return "#ff4d4f";
    if (risk === "Medium") return "#faad14";
    if (risk === "Low") return "#52c41a";
    return "#000";
  };

  const selectedArea = areas.find(a => a.name === area);

  // 🔹 Animated marker using DivIcon
  const createMarker = () => {
    return new L.DivIcon({
      className: `pulse-marker ${finalRisk?.toLowerCase()}`,
      iconSize: [25, 25],
      html: "<div></div>"
    });
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {finalRisk === "High" && (
        <div className="toast">⚠ HIGH FLOOD RISK in {area}</div>
      )}

      <header>
        <h1>Flood Risk Monitoring Dashboard</h1>
      </header>

      <div className="content">
        {/* Left Panel */}
        <div className="panel map-panel">
          <h3>Select Area</h3>
          <select value={area} onChange={e => setArea(e.target.value)}>
            {areas.map(a => (
              <option key={a.name}>{a.name}</option>
            ))}
          </select>

          {loading ? (
            <p className="loading-text">Fetching live data...</p>
          ) : (
            <div className="risk-info">
              <p>Model Risk: <b>{risk}</b></p>
              <p>Area Sensitivity: <b>{selectedArea?.sensitivity}</b></p>
              <p style={{ color: getColor(finalRisk), fontSize: "24px" }}>
                Final Risk: <b>{finalRisk}</b>
              </p>
            </div>
          )}

          {/* Map */}
          {selectedArea && (
            <MapContainer
              key={area}
              center={[selectedArea.lat, selectedArea.lon]}
              zoom={12}
              style={{ height: "300px", width: "100%", marginTop: "20px", borderRadius: "15px" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={[selectedArea.lat, selectedArea.lon]}
                icon={createMarker()}
              >
                <Popup>
                  <b>{selectedArea.name}</b><br />
                  Risk: {finalRisk}
                </Popup>
              </Marker>
            </MapContainer>
          )}
        </div>

        {/* Right Panel */}
        <div className="panel chart-panel">
          <h3>Rainfall Trend (mm)</h3>
          <LineChart width={500} height={300} data={rainfallData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="rain" stroke="#1890ff" animationDuration={1200} />
          </LineChart>
        </div>
      </div>
    </div>
  );
}

export default App;