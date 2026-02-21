# Necookie Central Hub

Necookie Central Hub is a comprehensive, full-stack personal productivity and lifestyle management dashboard. It centralizes various aspects of daily tracking, from finances and to-do lists to personal diary entries and secure vault storage, all within a sleek, modern interface.

## 🚀 Features

- **Dashboard:** A centralized overview of your daily activities, tasks, and financial summaries.
- **Finance Tracker:** Comprehensive tools for managing your money, complete with interactive charts, a finance calendar, and a dedicated savings vault.
- **Todo List Management:** Advanced task tracking with tags, priorities, and flexible views.
- **Diary:** A personal digital journal to log your thoughts and experiences securely.
- **Vault:** A secure storage area for your sensitive data and files.
- **AI Chatbot:** An integrated AI assistant powered by OpenAI for quick queries and assistance.
- **Theme Selector:** Customizable UI with support for Dark, Light, and System themes.
- **History:** Track changes and activities effortlessly across the platform.

## 🛠 Tech Stack

### Frontend (Client)
- **Framework:** React 19 with Vite
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS
- **State/Data Fetching:** React Query & Supabase Client
- **Charts:** Recharts
- **Icons:** Lucide React

### Backend (Server)
- **Environment:** Node.js with Express.js
- **Database:** PostgreSQL (managed natively via `pg` or `sequelize` and optionally paired with Supabase)
- **AI Integration:** OpenAI SDK
- **Authentication/BaaS:** Supabase

## 📂 Project Structure

The repository is structured as a monorepo containing both the client and server codebases.

```text
hub.necookie.dev/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI elements (Dashboard, Finance, Todo, Modals)
│   │   ├── pages/          # Application routes (Dashboard, Diary, Finance, Todo, Vault)
│   │   ├── services/       # API call wrappers
│   │   └── ...
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite build configuration
├── server/                 # Node.js backend application
│   ├── routes/             # API endpoint definitions
│   ├── controllers/        # Request handling logic
│   ├── index.js            # Express server entry point
│   ├── todo_migrations.sql # Database migration schemas
│   └── package.json        # Backend dependencies
└── README.md
```

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Supabase project for database and authentication
- OpenAI API Key (if utilizing chatbot features)

### 1. Backend Setup
Navigate to the server directory, install dependencies, and start the development server.

```bash
cd server
npm install

# Rename or create a .env file and fill in the necessary secrets:
# PORT, DATABASE_URL, SUPABASE_URL, SUPABASE_KEY, OPENAI_API_KEY, etc.

npm run dev
```

### 2. Frontend Setup
In a new terminal, navigate to the client directory, install dependencies, and run the Vite server.

```bash
cd client
npm install

# Configure your environment variables for Supabase in a .env local file
# VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

npm run dev
```

### 3. Usage
Open [http://localhost:5173](http://localhost:5173) (default Vite port) in your browser to view the application.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License
This project is proprietary and confidential. All rights reserved.
