# Universal AI Code Translator

<p align="center">
  <img src="public/favicon.ico" alt="Universal AI Code Translator Logo" width="100"/>
</p>

<h3 align="center">Seamlessly port algorithms, applications, and logic across different programming languages with context-aware AI explanations.</h3>

---

## ✨ Features

- **Multi-Language Support**: Translate code between C++, Python, Java, JavaScript, TypeScript, C#, Go, Rust, Kotlin, and Swift.
- **Simultaneous Multi-Targeting**: Translate from a single source language into up to *two* different target languages simultaneously (e.g., C++ → Python AND Java).
- **AI-Powered Explanations**: Powered by Google's **Gemini 2.5 Flash**, the engine provides intelligent explanations of syntax changes, library replacements, and memory model differences.
- **Simplest Code Form**: Output is strictly optimized to produce the cleanest, most idiomatic code with zero distracting comments.
- **Stunning UI/UX**: Built with Next.js and Tailwind CSS v4, featuring immersive glassmorphism, Framer Motion animations, and Monaco Editor integration.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **AI Engine**: [Google Gemini 2.5 Flash API](https://aistudio.google.com/)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) via `@monaco-editor/react`
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm
- A free Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ganeshshejul/universal-ai-code-translator.git
   cd universal-ai-code-translator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the App:**
   Navigate to `http://localhost:3000` in your browser.

## 💡 Usage

1. Select your **Source Language** from the dropdown on the left.
2. Select your **Target Language(s)** from the dropdowns on the right. Use the **+ Add** button to add a second target language!
3. Paste your algorithm or logic into the source editor.
4. Click **Translate**.
5. Watch as the AI instantly ports your code into the cleanest possible idiomatic form and explains the differences below.

---

*Designed for Developers, Students, and Enterprises looking to modernize codebases and learn new languages.*
