# PsychAI: AI-Powered Telepsychiatry Platform

PsychAI is a modern, comprehensive telepsychiatry and mental wellness platform that bridges the gap between patients and clinicians. By leveraging advanced Artificial Intelligence (Groq API), realtime databases, and a sleek user interface, PsychAI delivers personalized mental health support for patients and powerful analytical tools for psychologists.

This repository contains the complete ecosystem, split into three interconnected applications:

## The PsychAI Ecosystem

### 1. Patient Application
A safe, engaging, and private portal for patients to manage their mental wellness daily.
- **AI Therapy Companion:** 24/7 conversational support powered by Groq's ultra-fast LLMs.
- **Mood Tracking:** Daily mood check-ins with intuitive sliding scales and emotional tagging.
- **Mindfulness Hub:** Guided exercises, breathing techniques, and meditation resources.
- **Private Journaling:** Secure, encrypted diary entries for personal reflection.
- **Crisis Detection:** Automatic escalation to their linked clinician if high-risk language is detected in chat or journals.

### 2. Clinician Dashboard
A powerful command center for psychologists and therapists to monitor their patient roster in real-time.
- **Patient Roster & Analytics:** High-level overview of patient wellness scores, risk levels, and engagement.
- **Real-Time Crisis Alerts:** Instant notifications when a patient logs a critically low mood or exhibits warning signs.
- **AI Session Summaries:** Automated summarization of patient activities, mood trends, and chat logs before a session.
- **Secure Messaging:** Direct, secure communication channel with linked patients.
- **Clinical Notes:** Built-in tools to record session notes, PHQ-9/GAD-7 scores, and diagnoses.

### 3. Web Application (Landing & Marketing)
The public-facing portal for PsychAI.
- **Service Overview:** Explains the platform's benefits to both clinics and individual users.
- **Onboarding Flow:** Seamless registration and routing for new patients and clinicians.

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Recharts, Framer Motion
- **Backend & Database:** Supabase (PostgreSQL), Row Level Security (RLS)
- **Authentication:** Supabase Auth (Secure JWTs, Role-based routing)
- **Artificial Intelligence:** Groq API (LLaMA-3 / Mixtral models for real-time inference)
- **Deployment:** Vercel (Recommended)

---

## Quick Start & Local Development

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com/) project
- A [Groq](https://console.groq.com/) API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/PsychAI.git
   cd PsychAI
   ```

2. **Setup Environment Variables:**
   Create a `.env.local` file in the root of the respective applications and add your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GROQ_API_KEY=your_groq_api_key
   ```

3. **Install Dependencies & Run (for any app):**
   ```bash
   npm install
   npm run dev
   ```

4. **Access the Apps:**
   - Patient App: `http://localhost:3000`
   - Clinician App: `http://localhost:3001`

---

## Security & Privacy
PsychAI is built with strict Row Level Security (RLS) policies. Clinicians can only view data for patients explicitly linked to them via cryptographic consent, and patients have total control over their private journals and chat logs. All database interactions are securely handled via Supabase.
