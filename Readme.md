# PhishGuardAI 🛡️

PhishGuardAI is a powerful Chrome extension that provides real-time protection against phishing and social engineering attacks. It leverages a sophisticated two-layer detection system: a first layer using Google's Gemini LLM for intelligent content analysis, and a second verification layer using a quantum algorithm simulated with Qiskit.



---
## ✨ Features

* **Two-Layer Detection:** Combines state-of-the-art AI analysis with a quantum-based verification layer for robust threat detection.
* **Comprehensive Scanning:** Analyzes page URL, text content, links, and form elements (like password fields) to get a complete picture of potential threats.
* **Real-time High-Risk Alerts:** Injects an unmissable warning banner directly onto dangerous websites for 10 seconds.
* **Modern & Intuitive UI:** A clean, visually engaging popup built with React provides a clear risk score, detailed justification from the AI, and a dynamic risk bar.
* **Secure:** Your Gemini API key is managed locally using a `.env` file and is never exposed.

---

---
## 🚀 Setup and Installation

To get PhishGuardAI running on your local machine, follow these steps.

### Prerequisites

* [**Python**](https://www.python.org/downloads/) (version 3.8 or higher)
* [**Node.js and npm**](https://nodejs.org/) (version 16 or higher)
* A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 1. Backend Setup

The backend server performs the AI and Quantum analysis.

```bash
# 1. Navigate to the backend directory
cd PhishGuardAI/backend

# 2. Create the .env file for your API key
# Create a new file named .env and add your key like this:
# GEMINI_API_KEY="YOUR_API_KEY_HERE"

# 3. Create a Python virtual environment
python -m venv venv

# 4. Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 5. Install the required Python packages
pip install -r requirements.txt


# 1. Navigate to the project's root directory
cd PhishGuardAI

# 2. Install Node.js dependencies
npm install

# 3. Compile the React UI code (IMPORTANT!)
# This command converts the JSX in popup.js to plain JavaScript.
# You must run this command every time you change the React code.
npm run build

#4. Start the backend server
python main.py