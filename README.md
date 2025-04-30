# ⚡ Effisense – AI-Powered Productivity Manager

Effisense is a smart productivity dashboard designed to help you manage tasks, track productivity, and get personalized AI time suggestions — all from a clean, intuitive UI.

Built with ❤️ using React, Tailwind CSS, Appwrite, and Groq’s LLaMA 3.3 model.

---

## 🚀 Features

- ✅ Smart Task Management (CRUD, filters, reminders)
- 📅 One-way Google Calendar sync
- 📊 Productivity Analytics Dashboard
- 🧠 AI Assistant (Groq LLaMA 3.3):
  - Time suggestions based on availability
  - Title rewriting and description summarization
  - Behavioral insights and focus-time prediction
- 🌙 Responsive dark/light UI with smooth UX
- 🔒 Google Verified OAuth + privacy-focused

---

## 🌐 Live Demo

[https://effisense.ayush-sharma.in](https://effisense.ayush-sharma.in)

---

## 🧠 Tech Stack

| Layer     | Tech                                                                 |
|-----------|----------------------------------------------------------------------|
| Frontend  | React + Vite + Tailwind CSS + Framer Motion                          |
| Backend   | Appwrite (Auth + Database)                                           |
| Auth      | Appwrite Auth + Google OAuth                                         |
| AI        | Groq API (LLaMA 3.3 70B model)                                       |
| Charts    | Recharts                                                             |
| Calendar  | Google Calendar API (1-way sync)                                     |
| Hosting   | Vercel                                                               |

---

## 📦 Installation (via `pnpm`)

> Make sure `pnpm` is installed globally. [Get it here](https://pnpm.io/installation)

```bash
git clone https://github.com/CyberBoyAyush/Effisense.git
cd Effisense
pnpm install
pnpm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in the root with the following:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DB_ID=your_db_id
VITE_APPWRITE_COLLECTION_ID=tasks

VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=https://effisense.ayush-sharma.in/oauth2callback

VITE_GROQ_API_KEY=your_groq_api_key
```

---

## 📁 Folder Structure

```
Effisense/
├── src/
│   ├── components/         # Reusable UI components (tasks, charts, modals)
│   ├── pages/              # Main route pages (Dashboard, Analytics, etc.)
│   ├── api/                # Google Calendar & Appwrite logic
│   ├── utils/              # AI integrations (aiAssistant.js), helpers
│   ├── styles/             # Tailwind config & global CSS
│   └── App.jsx             # Main App shell
├── public/
├── .env                    # Local environment variables
└── vercel.json             # Vercel redirect config
```

---

## ✨ Upcoming Features

- 🔁 Habit tracking + visual streaks
- 🔔 Push/email reminders with time optimization
- 📱 PWA + mobile offline support
- 📈 Weekly productivity report
- 🔓 Public sharing of task lists/notes

---

## 🤝 Contributing

Effisense is in active beta — contributions, feedback, and testers are welcome!

- Fork the repo
- Create a new branch (`feat/feature-name`)
- Submit a PR with a clear description

---

## 📬 Contact

Made with ❤️ by [@CyberBoyAyush](https://github.com/CyberBoyAyush)  
Drop your email in the comments of this [LinkedIn post](https://www.linkedin.com/posts/cyberboyayush_effisense-productivity-groq-activity-7319714846407606272-NaY2?utm_source=share&utm_medium=member_desktop&rcm=ACoAADWPj8IBQZK_wACuQ1Tx9uQdMZvgqkac0jU) to test future builds early.

---

📄 License

Effisense is licensed under the GNU General Public License v3.0.

This means:
	•	You can use, modify, and share the code freely.
	•	You must credit the original author (Ayush Sharma) with original repository link.
	•	If you distribute modified versions, they must also be open source under GPL v3.0.