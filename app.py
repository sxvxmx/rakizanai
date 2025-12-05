from flask import Flask, render_template, request, jsonify
from neuro.ask import ask_advanced
from dotenv import load_dotenv
import os

app = Flask(__name__)
load_dotenv()

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/ask", methods=["POST"])
def api_ask():
    try:
        data = request.json
        question = data.get("question", "")

        if not question:
            return jsonify({"error": "Question is required"}), 400

        answer = ask_advanced(question)

        return jsonify({"question": question, "answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def run_app():
    print("Starting Rakuzan AI Flask application...")
    port = int(os.environ.get("PORT", 8080))
    print(f" * Running on http://0.0.0.0:{port}")
    print(" * Debug mode: on")
    print(" * Visit http://localhost:8080 in your browser to use the AI interface")
    app.run(debug=True, host="0.0.0.0", port=port, use_reloader=False)


if __name__ == "__main__":
    run_app()
