from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

model = joblib.load("C:\\Users\\priya\\PycharmProjects\\Coastal-prediction\\flood_risk_model.pkl")

risk_map = {
    0: "High",
    1: "Low",
    2: "Medium"
}

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    df = pd.DataFrame([data])

    pred = model.predict(df)[0]

    return jsonify({
        "risk": risk_map[int(pred)]
    })

if __name__ == "__main__":
    app.run(port=5000)