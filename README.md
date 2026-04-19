# DeepSeek AI Chat System

A modern, full-stack conversational AI application powered by DeepSeek models, featuring a stunning sci-fi inspired UI with particle effects.

![DeepSeek Chat](https://img.shields.io/badge/DeepSeek-AI%20Chat-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)

## Features

- **Dual Model Support**
  - DeepSeek V3: Fast conversational responses
  - DeepSeek R1: Deep reasoning with thinking process display

- **Modern Tech UI**
  - Dynamic particle background with mouse interaction
  - Glass morphism design
  - Gradient colors and smooth animations
  - Responsive layout

- **Real-time Streaming**
  - Server-Sent Events (SSE) for streaming responses
  - Live thinking process visualization
  - Stop generation support

- **Conversation Management**
  - Create, delete, and switch conversations
  - Persistent chat history with SQLite
  - Auto-generated conversation titles

- **Error Handling**
  - Toast notifications
  - Retry mechanism
  - Network status monitoring

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- react-markdown + react-syntax-highlighter

### Backend
- Python FastAPI
- SQLAlchemy + SQLite
- OpenAI SDK (DeepSeek compatible)
- SSE-Starlette

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- DeepSeek API Key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/deepseek-chat.git
cd deepseek-chat
```

2. **Setup Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
echo "DEEPSEEK_API_KEY=your_api_key_here" > .env
echo "DEEPSEEK_BASE_URL=https://api.deepseek.com" >> .env
echo "DEEPSEEK_MODEL=deepseek-chat" >> .env
echo "DATABASE_URL=sqlite:///./chat.db" >> .env
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
```

4. **Start the application**

Backend:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:
```bash
cd frontend
npm run dev
```

5. **Open browser**
```
http://localhost:5173
```

## Project Structure

```
chatgpt-clone/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Configuration
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── models/              # Database models
│   │   ├── routers/             # API routes
│   │   ├── schemas/             # Pydantic schemas
│   │   └── services/            # Business logic
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── contexts/            # React contexts
│   │   ├── services/            # API services
│   │   ├── types/               # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/conversations` | List conversations |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations/{id}` | Get conversation detail |
| PUT | `/api/conversations/{id}` | Update conversation |
| DELETE | `/api/conversations/{id}` | Delete conversation |
| POST | `/api/chat` | Send message (SSE stream) |

## License

MIT License

## Acknowledgments

- [DeepSeek](https://www.deepseek.com/) for the powerful AI models
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent Python web framework
- [React](https://react.dev/) for the frontend library
