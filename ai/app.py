from flask import Flask, request, jsonify
import pickle
import re
from sklearn.feature_extraction.text import TfidfVectorizer

app = Flask(__name__)

# Load the model (placeholder, need to train first)
# model = pickle.load(open('model.pkl', 'rb'))
# vectorizer = pickle.load(open('vectorizer.pkl', 'rb'))

def preprocess_text(text):
    # Simple preprocessing
    text = re.sub(r'\W', ' ', text)
    text = text.lower()
    return text

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    text = data['text']
    processed = preprocess_text(text)
    # features = vectorizer.transform([processed])
    # prediction = model.predict(features)[0]
    # For now, dummy response
    prediction = 'safe' if 'fraud' not in text.lower() else 'fraud'
    return jsonify({'prediction': prediction})

if __name__ == '__main__':
    app.run(debug=True, port=8000)