import os
from flask import Flask, request , jsonify
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)

@app.route("/analyze-text/<secret_key>", methods=["POST"])
def analyzeText(secret_key):
   if(request.method == "POST"):
      secret = secret_key
      if(secret == os.getenv("secret_key")):
        return "heloo"


if __name__ in "__main__":
   app.run(debug=True)