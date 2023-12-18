import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from textblob import TextBlob
from deep_translator import GoogleTranslator

nltk.download("vader_lexicon")

analyzer = SentimentIntensityAnalyzer()

app = Flask(__name__)
limiter = Limiter(key_func=get_remote_address, storage_uri="memory://")
limiter.init_app(app)
load_dotenv()

def analyze_sentiment(text):
    translated = GoogleTranslator(source='tl', target='en').translate(text)
    vader_scores = analyzer.polarity_scores(translated)
    vader_compound_score = vader_scores["compound"]
   
    blob = TextBlob(text)
    textblob_polarity = blob.sentiment.polarity

    combined_score = (vader_compound_score + textblob_polarity) / 2

    if combined_score >= 0.05:
        return "Positive"
    elif combined_score <= -0.05:
        return "Negative"
    else:
        return "Neutral"
   

@limiter.limit("10/minute")
@app.route("/analyze-text/<secret_key>", methods=["POST"])
def analyze_text(secret_key):
    if request.method == "POST":
        secret = secret_key
        if secret == os.getenv("SECRET_KEY"):
            data = request.get_json()
            if "content" in data:
                content = data.get("content")
                sentiment = analyze_sentiment(content)
                return jsonify(message="Hello, analysis result here!", result=sentiment)

        return jsonify(error="Unauthorized"), 401
    return jsonify(error="Method Not Allowed"), 405

if __name__ == "__main__":
    app.run(debug=True)
