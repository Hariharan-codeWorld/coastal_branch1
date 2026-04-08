const mongoose = require("./db");
const Area = require("./models/Area");

async function seedData() {
    try {
        await Area.deleteMany();

        await Area.insertMany([

            // 🔴 HIGH RISK (Flood-prone, low-lying, coastal)
            { name: "Velachery", lat: 12.98, lon: 80.22, sensitivity: "High" },
            { name: "Adyar", lat: 13.00, lon: 80.25, sensitivity: "High" },
            { name: "Pallikaranai", lat: 12.93, lon: 80.20, sensitivity: "High" },
            { name: "Perungudi", lat: 12.96, lon: 80.24, sensitivity: "High" },
            { name: "Sholinganallur", lat: 12.90, lon: 80.23, sensitivity: "High" },
            { name: "Thoraipakkam", lat: 12.94, lon: 80.23, sensitivity: "High" },
            { name: "ECR", lat: 12.78, lon: 80.25, sensitivity: "High" },
            { name: "Besant Nagar", lat: 13.00, lon: 80.27, sensitivity: "High" },
            { name: "Mylapore", lat: 13.03, lon: 80.27, sensitivity: "High" },
            { name: "Triplicane", lat: 13.05, lon: 80.28, sensitivity: "High" },
            { name: "Royapuram", lat: 13.12, lon: 80.29, sensitivity: "High" },

            // 🟠 MEDIUM RISK (urban + moderate drainage)
            { name: "Tambaram", lat: 12.92, lon: 80.12, sensitivity: "Medium" },
            { name: "Chromepet", lat: 12.95, lon: 80.14, sensitivity: "Medium" },
            { name: "Porur", lat: 13.03, lon: 80.16, sensitivity: "Medium" },
            { name: "T Nagar", lat: 13.04, lon: 80.23, sensitivity: "Medium" },
            { name: "Guindy", lat: 13.01, lon: 80.22, sensitivity: "Medium" },
            { name: "Madipakkam", lat: 12.96, lon: 80.19, sensitivity: "Medium" },
            { name: "Medavakkam", lat: 12.92, lon: 80.19, sensitivity: "Medium" },
            { name: "Ambattur", lat: 13.11, lon: 80.15, sensitivity: "Medium" },
            { name: "Avadi", lat: 13.11, lon: 80.10, sensitivity: "Medium" },

            // 🟢 LOWER RISK (comparatively safer zones)
            { name: "Anna Nagar", lat: 13.08, lon: 80.21, sensitivity: "Low" },
            { name: "KK Nagar", lat: 13.04, lon: 80.20, sensitivity: "Low" },
            { name: "Ashok Nagar", lat: 13.03, lon: 80.21, sensitivity: "Low" },
            { name: "Vadapalani", lat: 13.05, lon: 80.21, sensitivity: "Low" },
            { name: "Mogappair", lat: 13.08, lon: 80.17, sensitivity: "Low" },

            

        ]);

        console.log("🌱 Data Seeded Successfully!");
        process.exit();

    } catch (err) {
        console.log("❌ Seed Error:", err);
    }
}

seedData();