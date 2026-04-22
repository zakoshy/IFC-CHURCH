# Imani Church Manager (IFC CHURCH)

A professional, full-stack church management platform designed to digitize operations, improve member follow-up, and provide private AI-powered scripture counseling.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 4
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Markdown:** React Markdown (for AI responses)
- **Date Handling:** date-fns

### Backend & Database
- **Server:** Node.js with Express (Middleware Mode)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Email & Social)
- **Security:** PostgreSQL Row Level Security (RLS)

### AI & Services
- **AI Intelligence:** Google Gemini AI (@google/genai)
- **Scripture Data:** Bible-API.com
- **Payments:** M-Pesa Integration (STK Push)

---

## 🛠️ Features

### For the Pastor
- **Pastor's Dashboard:** Real-time overview of church health, attendance, and giving.
- **AI Sermon Generator:** Craft structured, scriptural sermons with authoratative outlines in seconds.
- **Scripture Counselor & Oversight:** Private AI assistant for pastoral study and member crisis monitoring (flagged anonymously).
- **Prayer Wall Management:** Review and track prayer requests from the congregation.
- **Notification System:** Manage announcements and system updates.

### For Members
- **Public Main Site:** Professional church landing page with vision, mission, and live announcements.
- **Personal Dashboard:** Track contributions, attendance records, and personal prayer requests.
- **Scripture Counselor:** Private, 24/7 AI spiritual guidance rooted in the Holy Word.
- **Holy Bible Reader:** Interactive Bible with search and chapter navigation.
- **Tithing & Giving:** Secure giving via M-Pesa.

---

## 📦 Getting Started

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file based on `.env.example`.
4. **Start Development Server:**
   ```bash
   npm run dev
   ```

## 🔒 Security & Privacy
- **Confidentiality:** AI counseling is private to the user. Pastor only sees anonymous "Crisis Flags" if severe emotional distress is detected.
- **Data Protection:** All user data is secured via Supabase RLS policies.
