# Way to Words Backend Server

Express.js backend server for the Way to Words chat bot application.
Integrates with HuggingFace Inference API for AI-powered chat responses.

## Backend Setup

### Prerequisites

- Node.js 18+ (for native `fetch` support)
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file in the `server` directory:
```env
HF_TOKEN=your_huggingface_token_here
PORT=4000
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `HF_TOKEN` | HuggingFace API access token | Yes | - |
| `PORT` | Server port number | No | 4000 |

### Running the Server

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:4000` (or the port specified in `.env`).

### Project Structure

```
server/
├── index.js          # Main Express server and API endpoints
├── hfClient.js       # HuggingFace API client with logging
├── .env              # Environment variables (not in git)
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## HuggingFace Integration

The server uses the HuggingFace Inference API with the `meta-llama/Llama-3.1-8B-Instruct` model.

To get your HuggingFace token:
1. Sign up at [HuggingFace](https://huggingface.co/join)
2. Go to [Access Tokens](https://huggingface.co/settings/tokens)
3. Create a new token with "Read" permissions
4. Add it to your `.env` file as `HF_TOKEN`

## API Endpoints

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### `POST /api/chat`
Chat endpoint for processing user messages.

**Request:**
```json
{
  "message": "Hello!",
  "topic": "IT",
  "cefrLevel": "B1",
  "history": [
    {
      "author": "user",
      "text": "Previous message"
    }
  ]
}
```

**Response:**
```json
{
  "reply": "Hello! How can I help you learn English today?",
  "timestamp": "2025-01-20T14:07:00.000Z"
}
```

### `POST /api/evaluate`
AI-powered CEFR level evaluation endpoint. Evaluates user's English answer and returns CEFR level assessment.

**Request:**
```json
{
  "answer": "I like to read books and watch movies in English. I can understand most conversations but sometimes I need to ask for clarification."
}
```

**Response:**
```json
{
  "level": "B1",
  "explanation": "Your answer demonstrates intermediate English skills. You can understand the main points of clear standard input on familiar matters.",
  "timestamp": "2025-01-20T14:07:00.000Z"
}
```

**Error Handling:**
- If the LLM response cannot be parsed as JSON, the endpoint uses RegExp to extract JSON
- If parsing fails completely, returns fallback: `{ "level": "B1", "explanation": "Fallback due to parse error" }`

## How It Works

### Chat Endpoint (`/api/chat`)

1. **Prompt Building**: The server builds a context-aware prompt that includes:
   - System role: English tutor for the user's CEFR level
   - Conversation topic
   - Recent conversation history (last 3-5 messages)
   - Current user message

2. **HuggingFace API Call**: Sends the prompt to the Llama-3.1-8B-Instruct model via HuggingFace Inference API

3. **Response Processing**: Extracts and cleans the generated response

4. **Error Handling**: Falls back to a friendly message if the API is unavailable

### Evaluate Endpoint (`/api/evaluate`)

1. **Prompt Building**: Creates an evaluation prompt asking the AI to rate the answer on CEFR A1–C2 scale

2. **HuggingFace API Call**: Sends the prompt to the same Llama-3.1-8B-Instruct model

3. **Response Parsing**: Uses multiple strategies to extract JSON:
   - First attempts direct `JSON.parse()`
   - If that fails, uses RegExp to find JSON object in the response
   - If all parsing fails, returns fallback response

4. **Validation**: Ensures the parsed level is a valid CEFR level (A1, A2, B1, B2, C1, C2)

5. **Error Handling**: Returns fallback response if parsing fails completely

## Architecture

### HuggingFace Client (`hfClient.js`)

The HuggingFace API client is separated into its own module for better code organization:

- **`callChatModel(prompt)`**: Unified function for calling HuggingFace Inference API
- **Logging**: Structured logging with success/error status and response time
- **Error Handling**: Comprehensive error handling with detailed error messages

**Log Format:**
```
[2025-01-20T12:00:00.000Z] ✅ HF_API_CALL | 1234ms | {"responseLength":150}
[2025-01-20T12:00:00.000Z] ❌ HF_API_ERROR | 500ms | {"status":503}
```

### Development

The server uses:
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing (enabled for `http://localhost:5173`)
- **dotenv** - Environment variable management
- **HuggingFace Inference API** - AI model integration (via `hfClient.js`)

## Model Information

- **Model**: `meta-llama/Llama-3.1-8B-Instruct`
- **API**: HuggingFace Inference API
- **Parameters**:
  - `max_new_tokens`: 250
  - `temperature`: 0.7
  - `top_p`: 0.9

## AI-Powered Level Test

The `/api/evaluate` endpoint provides a prototype AI-powered CEFR level assessment without requiring fine-tuning.

### How It Works

1. **User submits answer** → Frontend sends answer text to `/api/evaluate`
2. **Prompt construction** → Server creates evaluation prompt asking AI to rate on CEFR A1–C2 scale
3. **AI evaluation** → HuggingFace model analyzes the answer and returns JSON with level and explanation
4. **Response parsing** → Server uses multiple strategies to extract JSON:
   - Direct `JSON.parse()` on response
   - RegExp extraction if JSON is embedded in text
   - Fallback to B1 level if parsing fails
5. **Result** → Returns `{ level, explanation }` to frontend

### Prototype Approach

This is a **prototype** that uses prompt engineering instead of fine-tuning:
- **Advantages**: No model training required, quick to implement, flexible
- **Limitations**: May be less accurate than a fine-tuned model, depends on LLM's general knowledge
- **Future**: Can be improved with fine-tuning on CEFR evaluation dataset

### Example Flow

```
User: "I like to read books and watch movies in English."
  ↓
AI Prompt: "You are an English examiner. Rate the following answer..."
  ↓
AI Response: {"level": "B1", "explanation": "Your answer demonstrates..."}
  ↓
Frontend: Displays level and explanation
```

## Error Handling

The server handles various error cases:
- Model loading (503 errors) - Returns fallback message
- Network errors - Returns fallback message
- Invalid responses - Returns fallback message
- Missing token - Returns error message
- JSON parsing failures - Uses RegExp extraction, then fallback

