# Yubibot (๑>◡<๑)

Yubibot is a feature-rich, lightweight, and multimodal WhatsApp assistant built with Node.js and `@whiskeysockets/baileys`. It features a unique, shy yet firm persona and a Dual-AI fallback architecture utilizing Groq for lightning-fast text processing and Gemini for advanced vision and backup capabilities.

---

## 🚀 Key Features

- **Dual-AI Architecture:** Powered by Groq API (primary for high-speed text responses) with automatic fallback to Gemini API.

- **Multimodal Vision:** Capable of receiving images with captions and analyzing them using Google Gemini's vision models.

- **Pairing Code Authentication:** Connect securely to WhatsApp using an 8-digit pairing code directly from your terminal—no QR code scanning required.

- **Session Persistence:** Automatically manages authentication state using multi-file auth persistence.

- **Consistent Persona:** Responds with a unique, defined character configured via `persona.md`.

---

## 🛠️ Prerequisites

Ensure you have the following installed on your system (Linux, macOS, or Windows):
- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Biyubiii/wabot.git
cd yubibot
```

## 2. Install Dependencies
```
npm install
```

## 3. Configure Environment Variables
Create a .env file in the root directory and add your API keys:
```
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

## 4. Set Up Your Persona
Ensure the persona.md file exists in the root directory to define Yubi's behavior and personality.

## 5. Running the Bot
Start the application with:
```
node index.js
```

---

-First-time connection: The console will prompt you to enter your WhatsApp bot phone number (e.g., 628xxxxxxxxxx). An 8-digit pairing code will appear.

-Open WhatsApp on your phone -> Linked Devices -> Link a Device -> Link with phone number instead, and enter the code.

-Subsequent runs will reuse the saved session inside the auth_info/ directory automatically.

---

## 📂 Project Structure
```
├── index.js        # WhatsApp socket connection & event handlers
├── ai.js           # Dual-AI fallback text generation (Groq & Gemini)
├── vision.js       # Multimodal image processing module (Gemini Vision)
├── chat.js         # Conversation flow and context management
├── db.js           # Simple JSON-based local database for history
├── persona.md      # Bot personality and instruction prompt
├── .env            # Private API keys (git-ignored)
└── auth_info/      # Persistent session tokens (git-ignored)
```

---

## 📄 License
This project is open-source and available under the MIT License.
