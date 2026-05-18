<<<<<<< HEAD
# AI-Powered Fraud Email & Message Detection System

A full-stack web application that detects fraudulent emails, SMS, and links using AI/ML models.

## Features

- **Email Scanner**: Upload email text or connect email account to scan for fraud
- **SMS Scanner**: Manual input or automatic sync for SMS fraud detection
- **Link Detector**: Analyze URLs for safety and suspicious patterns
- **AI Chatbot**: NLP-based assistant for fraud-related queries
- **History & Reports**: Store and export scan results
- **Authentication**: Secure login with OTP verification

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express
- **AI/ML**: Python, Scikit-learn, TensorFlow, NLTK
- **Database**: MongoDB
- **APIs**: Gmail API, Twilio

## Setup

### Prerequisites

- Node.js
- Python 3.8+
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
4. Install AI dependencies:
   ```bash
   cd ai
   pip install -r requirements.txt
   ```

### Running the Application

1. Start MongoDB
2. Start the AI service:
   ```bash
   cd ai
   python app.py
   ```
3. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

## Usage

1. Register/Login to the application
2. Use the dashboard to scan emails, SMS, or links
3. View results and history

## Security

- User data is encrypted and hashed
- OAuth for email access
- Privacy-compliant data handling

## License

MIT
