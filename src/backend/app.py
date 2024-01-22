import os

from dotenv import load_dotenv
from flask import Flask, request

load_dotenv()

app = Flask(__name__)


@app.route("/", methods=["GET"])
def index():
    data = {
        "data": "Hello from the Gitulyse backend index endpoint",
    }

    return data, 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
