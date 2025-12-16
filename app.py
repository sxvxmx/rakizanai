from flask import Flask, render_template, request, Response, stream_with_context
from neuro.ask import ask_advanced
from dotenv import load_dotenv
import os
import json

app = Flask(__name__)
load_dotenv()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/ask_stream", methods=["POST"])
def ask_stream():
    data = request.get_json(force=True)
    question = data.get("question", "")
    if not question:
        return {"error": "question required"}, 400

    def generate():
        for token in ask_advanced(question):
            yield json.dumps({"token": token}) + "\n"
        yield json.dumps({"done": True}) + "\n"

    headers = {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }
    return Response(stream_with_context(generate()), headers=headers)


def run_app():
    print("Starting Rakuzan AI Flask application...")
    port = int(os.environ.get("PORT", 8080))
    print(f" * Running on http://0.0.0.0:{port}")
    print(" * Debug mode: on")
    print(" * Visit http://localhost:8080 in your browser to use the AI interface")
    app.run(debug=True, host="0.0.0.0", port=port, use_reloader=False)


if __name__ == "__main__":
    run_app()
