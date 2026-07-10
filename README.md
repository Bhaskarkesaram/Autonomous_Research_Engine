# Nexora AI — Autonomous Multi-Agent Research Engine

An advanced **AI-powered multi-agent system** that performs intelligent task execution using modular agents, graph-based workflows, and Retrieval-Augmented Generation (RAG).

This project is designed to simulate a **cognitive architecture**, where multiple specialized agents collaborate under a supervisor to solve complex user queries.

---

# ✨ Key Features

* 🤖 **Multi-Agent System**

  * Supervisor agent for orchestration
  * Specialized sub-agents (Research, Analysis, Summarization)

* 🧠 **RAG (Retrieval-Augmented Generation)**

  * Context-aware responses using vector database

* 🔗 **Graph-Based Execution**

  * Dynamic workflow using nodes and conditional edges

* ⚙️ **Tool Integration**

  * File system tools
  * Search tools
  * Planning & delegation tools

* 💬 **Real-Time Chat UI**

  * Streaming responses
  * Interactive interface

* 📊 **Evaluation System**

  * Metrics tracking
  * Experiment runner

* 📄 **Export & Logs**

  * PDF export
  * Query history and logs

---

# 🏗️ Project Structure

```
COGNITIVE-ENGINE-MASTER/
│
├── backend/
│   ├── agents/
│   │   └── sub_agents/
│   │   |   ├── analysis_agent.py
│   │   |   ├── research_agent.py
│   │   |   ├── summarizer_agent.py
│   │   └── supervisor_agent.py
│   │
│   ├── ai/
│   │   ├── agents.py
│   │   ├── fact_check.py
│   │   ├── prompt_pipeline.py
│   │   ├── rag_engine.py
│   │   └── vector_db.py
│   │
│   ├── config/
│   │   ├── model_config.py
│   │   └── settings.py
│   │
│   ├── evaluation/
│   │   ├── evaluator.py
│   │   ├── experiment_runner.py
│   │   ├── metrics.py
│   │   └── milestone1_tests.py
│   │
│   ├── graph/
│   │   ├── conditional_edges.py
│   │   ├── graph_builder.py
│   │   ├── nodes.py
│   │   └── state.py
│   │
│   ├── prompts/
│   │   ├── subagent_prompt.txt
│   │   └── supervisor_prompt.txt
│   │
│   ├── runtime/
│   │   ├── executor.py
│   │   ├── llm.py
│   │   └── workflow_controller.py
│   │
│   ├── tools/
│   │   ├── delegation_tool.py
│   │   ├── file_system_tools.py
│   │   ├── planning_tool.py
│   │   ├── search_tool.py
│   │   └── test_planning_tool.py
│   │
│   └── main.py
│
├── frontend/
│   ├── app/
│   ├── components/
│   │   └── Chat/
|   |   |     └── ChatContainer.tsx
|   |   |     └── MessageBubbles.tsx
|   |   |     └── TypingLoader.tsx
│   │   ├── Sidebar/
|   |   |     └── ChatItem.tsx
|   |   |     └──Sidebar.tsx
│   │   └── UI/
|   |   |    └── AgentSelector.tsx
|   |   |    └── FileUpolad.tsx
|   |   |    └── Header.tsx
|   |   |    └── Navbar.tsx
|   |   └────── AgentFlow.tsx
|   |   └────── Auth.tsx
|   |   └────── ExportPDF.tsx
|   |   └────── HistoryPanel.tsx
|   |   └────── LogsPanel.tsx
|   |   └────── QueryInput.tsx
|   |   └────── TypingOutput.tsx
|   |   
│   ├── hooks/
|   |     └── useStream.tsx
│   ├── store/
|   |     └── useStore.tsx
│   └── public/
│
├── docs/
├── requirements.txt
├── package.json
└── README.md
```

---

# 🧠 System Architecture

```
User → Frontend (Next.js)
        ↓
Backend API (FastAPI)
        ↓
Supervisor Agent
        ↓
Sub Agents (Research / Analysis / Summarization)
        ↓
Graph Execution Engine
        ↓
RAG + Vector DB
        ↓
Final Response → Frontend (Streaming)
```

---

# ⚙️ Tech Stack

### 🔹 Backend

* Python
* FastAPI
* Multi-Agent Architecture
* RAG (Vector DB)

### 🔹 Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* Zustand (State Management)

---

# 🔧 Setup Instructions

## 1️⃣ Clone the Repository

```
git clone https://git@github.com:Bhaskarkesaram/Autonomous_Research_Engine.git
cd autonomous-cognitive-engine
```

---

## 2️⃣ Backend Setup

```
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r ../requirements.txt
```

### ▶️ Run Backend

```
uvicorn backend.main:app --reload              
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

## 3️⃣ Frontend Setup

```
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

# 🔐 Environment Variables

Create a `.env` file (backend):

```
OPENAI_API_KEY=your_api_key
MONGO_URI=your_database_url
JWT_SECRET=your_secret_key
```

---

# 🔄 Workflow Explanation

1. User submits a query via UI
2. Backend receives request
3. Supervisor agent creates execution plan
4. Sub-agents process tasks:

   * Research → gather info
   * Analysis → process logic
   * Summarization → generate output
5. Graph engine manages execution flow
6. RAG enhances context using vector DB
7. Final response is streamed to frontend

---

# 📊 Evaluation & Metrics

Located in:

```
backend/evaluation/
```

Includes:

* Performance metrics
* Experiment runner
* Automated test scenarios

---

# 🧪 Testing

```
python backend/evaluation/milestone1_tests.py
```

---

# 🚀 Deployment

### Frontend

Deploy using Vercel

### Backend

Deploy using Render or Railway

### Database

Use MongoDB Atlas

---

# ⚠️ Important Notes

Do NOT push:

```
.venv/
node_modules/
.env
.next/
__pycache__/
```

Ensure `.gitignore` is properly configured.

---

# 📌 Future Enhancements

* 🧠 Persistent agent memory
* ⚡ Performance optimization
* 🔐 Authentication system
* 📊 Admin dashboard
* 🌍 Multi-user support

---

# 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push to GitHub
5. Open a Pull Request

---

# 📄 License

MIT License

Copyright (c) 2026 Bhaskar Kesaram

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

# 👨‍💻 Author

**Bhaskar Kesaram**

---

# ⭐ Final Thoughts

This project demonstrates a **real-world AI system architecture** combining:

* Multi-agent collaboration
* Graph-based execution
* RAG-enhanced intelligence
* Modern full-stack development

If you found this useful, consider giving it a ⭐ on GitHub!
