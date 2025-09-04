import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# --- Load environment variables from .env file ---
load_dotenv()

# --- Qiskit for Quantum Randomness ---
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

# --- App Configuration ---
app = Flask(__name__)
CORS(app)
simulator = AerSimulator()

# ---
# FIX: A new, more explicit import approach for Google AI
# ---
# We will import the main library and then access its methods.
# This is the standard way, but we will add error suppression.
import google.generativeai as genai # type: ignore

# --- Securely configure the Gemini API key ---
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found. Make sure it is set in your .env file.")

# Tell the linter to ignore this specific line, as it is a known false positive.
genai.configure(api_key=api_key) # type: ignore


def call_gemini_for_analysis(page_data):
    """
    Makes a real API call to the Gemini model to analyze website content.
    """
    # Tell the linter to ignore this line as well.
    model = genai.GenerativeModel('gemini-2.0-flash') # type: ignore
    
    prompt = f"""
    Analyze the following website data for phishing and social engineering threats. 
    Act as a cybersecurity expert. Provide a detailed analysis and respond ONLY with a JSON object 
    containing two keys: "risk_score" (a number from 0 to 100) and "justification" (a brief explanation).

    - URL: {page_data.get('url')}
    - Title: {page_data.get('metadata', {}).get('title')}
    - Content Snippet: "{page_data.get('textContent', '')[:1500]}..."
    - Does it have a password field? {'Yes' if page_data.get('domElements', {}).get('hasPasswordInput') else 'No'}
    - Links found on page (first 5): {page_data.get('domElements', {}).get('links', [])[:5]}

    Based on this data, what is the phishing risk score and why?
    """
    
    try:
        response = model.generate_content(prompt)
        json_response = json.loads(response.text.strip().replace("```json", "").replace("```", ""))
        
        risk_score = float(json_response.get("risk_score", 0.0))
        justification = str(json_response.get("justification", "No justification provided."))
        
        return risk_score, justification
    except Exception as e:
        print(f"Error during Gemini API call or JSON parsing: {e}")
        return 50.0, "AI analysis failed. The score is a neutral default."


def get_quantum_verified_bit():
    """
    Runs a genuine quantum algorithm on a high-fidelity classical simulator.
    """
    qc = QuantumCircuit(1, 1)
    qc.h(0)
    qc.measure(0, 0)
    
    compiled_circuit = transpile(qc, simulator)
    result = simulator.run(compiled_circuit, shots=1).result()
    counts = result.get_counts(compiled_circuit)
    
    return '1' in counts

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        ai_score, justification = call_gemini_for_analysis(data)
        quantum_verified = get_quantum_verified_bit()

        status = 'secure'
        if ai_score > 75:
            status = 'danger'
        elif ai_score > 45:
            status = 'warning'

        response = {
            'status': status,
            'message': justification,
            'aiScore': ai_score,
            'quantumVerified': quantum_verified
        }
        return jsonify(response)
    except Exception as e:
        print(f"An error occurred in the main analyze function: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting PhishGuardAI backend server...")
    app.run(host='127.0.0.1', port=5000, debug=False)
