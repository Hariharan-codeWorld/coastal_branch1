const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
require('dotenv').config();

require("./db");
const Area = require("./models/Area");

const app = express();
app.use(express.json());
app.use(cors());

let latestRisk = "Unknown";
let lastAlertTime = 0;

// 🔹 Twilio
const smsClient = new twilio(process.env.twillio_sec1, process.env.twillio_sec2);

// 🔹 Email
async function sendEmail(risk) {
    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "hariharanm012006@gmail.com",
                pass: "xtpgoosvkuhtywkb"
            }
        });

        await transporter.sendMail({
            from: "hariharam012006@gmail.com",
            to: "hariharan7murugan@gmail.com",
            subject: "Flood Alert ⚠️",
            text: `⚠ Flood Risk is ${risk}. Take precautions immediately.`
        });

        console.log("📧 Email sent");
    } catch (err) {
        console.log("❌ Email Error:", err.message);
    }
}

// 🔹 SMS
async function sendSMS(risk) {
    try {
        await smsClient.messages.create({
            body: `⚠ Flood Risk is ${risk}. Stay alert!`,
            from: "+12602522084",
            to: "+918072717205"
        });

        console.log("📱 SMS sent");
    } catch (err) {
        console.log("❌ SMS Error:", err.message);
    }
}

// 🔹 GET areas (SAFE)
app.get("/areas", async (req, res) => {
    try {
        const areas = await Area.find();
        res.json(areas);
    } catch (err) {
        console.log("❌ Areas Error:", err.message);
        res.status(500).json({ error: "DB error" });
    }
});

// 🔹 GET risk
app.get("/risk", async (req, res) => {
    const areaName = req.query.area || "Velachery";

    try {
        const area = await Area.findOne({ name: areaName });

        if (!area) {
            return res.status(404).json({ error: "Area not found" });
        }

        const risk = await fetchRisk(area);

        res.json({ risk });

    } catch (err) {
        console.log("❌ Risk API Error:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// 🔹 CORE LOGIC
async function fetchRisk(area) {
    console.log("🌊 Fetching weather for", area.name);

    try {
        const weatherRes = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${area.lat}&longitude=${area.lon}&current=temperature_2m,relative_humidity_2m,precipitation`
        );

        const current = weatherRes.data.current;

        const month = new Date().getMonth() + 1;

        // 🌦️ Seasonal factor
        let seasonalFactor = 1;

        if ([10, 11, 12].includes(month)) {
            seasonalFactor = 2;
        } else if ([6, 7, 8].includes(month)) {
            seasonalFactor = 1.5;
        } else {
            seasonalFactor = 0.5;
        }

        // 🌧️ Rainfall calculation
        const rainfall = (current.precipitation || 0) * 10 * seasonalFactor;

        const data = {
            Rainfall: rainfall,
            Soil_Moisture: current.relative_humidity_2m || 50,
            Rainfall_lag1: rainfall * 0.8,
            Rainfall_lag2: rainfall * 0.6,
            Rainfall_lag3: rainfall * 0.4,
            Rainfall_3month_avg: rainfall * 0.7,
            Sea_Level_trend: 5 + (rainfall / 10),
            Month: month
        };

        const response = await axios.post(
            "http://127.0.0.1:5000/predict",
            data,
            { timeout: 5000 }
        );

        let risk = response.data.risk;

        // 🧠 RULE-BASED CORRECTION
        if (rainfall < 5) {
            risk = "Low";
        } else if (rainfall >= 5 && rainfall < 20) {
            risk = "Medium";
        }

        latestRisk = risk;

        console.log("✅ Final Risk:", risk, "| Rainfall:", rainfall);

        // 🔔 ALERT (only HIGH + cooldown)
        const now = Date.now();

        if (risk === "High" && now - lastAlertTime > 5 * 60 * 1000) {
            await sendEmail(risk);
            await sendSMS(risk);
            lastAlertTime = now;
        }
        // if (now - lastAlertTime > 1 * 60 * 1000) { // 1 min cooldown
        //     await sendEmail(risk);                 // This simulates the condition to alert even in low
        //     await sendSMS(risk);
        //     lastAlertTime = now;
        // }

        return risk;

    } catch (err) {
        console.log("❌ Prediction Error:", err.message);
        return "Error";
    }
}

// 🔁 Background job
cron.schedule("* * * * *", async () => {
    try {
        const area = await Area.findOne({ name: "Velachery" });
        if (area) {
            await fetchRisk(area);
        }
    } catch (err) {
        console.log("❌ Cron Error:", err.message);
    }
});


// 🚀 START SERVER
app.listen(3001, () => {
    console.log("🚀 Server running on http://localhost:3001");
});