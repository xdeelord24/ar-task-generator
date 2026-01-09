# AR Generator / Task Management App

A modern, high-performance task management and report generation application built with React, TypeScript, and Vite. This application features a premium UI with AI-powered assistance, multi-view task management, and professional document generation.

## 🚀 Key Features

*   **🤖 AI-Powered Workflow**: 
    *   **Autopilot Agents**: Create automated agents that trigger on task events (creation, updates) to modify tasks, send notifications, or run AI instructions.
    *   **Dual AI Support**: Choose between **Google Gemini (Cloud)** or **Ollama (Local)** for privacy-focused AI.
    *   **Rich Assistance**: Smart JSON-based task modification and Markdown-formatted responses.
*   **📋 Multi-View Task Management**:
    *   **List View**: Spreadsheet-like efficiency for bulk task management.
    *   **Kanban Board**: Drag-and-drop workflow visualization with customizable status columns.
    *   **Calendar**: Track deadlines and schedule tasks visually.
    *   **Gantt Chart**: Visual project timeline and dependency management.
    *   **Timesheet**: Professional time tracking and log management with daily totals.
    *   **Dashboard**: Customizable widgets for high-level project stats and charts.
*   **🎥 Clips & Media**:
    *   **Video Hub**: Manage screen recordings and video messages.
    *   **Interactive Player**: Comment on specific timestamps and view transcripts.
*   **🎮 Gamification & Productivity**:
    *   **XP System**: Earn experience points for completing tasks and level up your profile.
    *   **Stopwatch/Timer**: Integrated time tracking with active timers.
    *   **Focus Mode**: Minimize distractions with collapsible sidebars and clean UI.
*   **⚡ Real-Time Collaboration**:
    *   **Live Updates**: Socket.IO integration ensures changes reflect instantly across all connected clients.
    *   **Team Workspaces**: Shared spaces and folders for team coordination.
    *   **Comments & Chat**: Context-aware discussions on tasks and clips.
*   **📄 Professional Report Generation**:
    *   Generate official reports (AR/Work Logs) directly from your tasks.
    *   Export high-quality `.docx` documents with automated formatting.
    *   Template-based generation for consistent document standards.
*   **✨ Premium UI/UX**:
    *   **Collapsible Sidebar**: Maximize your workspace with a responsive, icon-retaining sidebar.
    *   **Theme System**: Fully integrated Dark/Light/System modes with custom accent colors.
    *   **Smart Notifications**: Browser and in-app alerts for due dates and assignments.
    *   **Modern Aesthetics**: Glassmorphism, smooth animations, and a refined "Premium" date picker.

## 🛠️ Technology Stack

**Frontend:**
*   **Core**: React 19, Vite, TypeScript
*   **State Management**: Zustand
*   **Real-Time**: Socket.IO Client
*   **Styling**: Vanilla CSS (Variables & Tokens)
*   **UI Components**: Lucide React (Icons), @dnd-kit (Drag & Drop)
*   **Utilities**: date-fns, react-markdown, remark-gfm

**Backend:**
*   **Server**: Node.js, Express
*   **Database**: SQLite
*   **Authentication**: JWT, bcryptjs
*   **Real-Time Server**: Socket.IO

**AI & Utilities:**
*   **Integration**: @google/generative-ai (Gemini), Ollama API
*   **Reports**: docx, file-saver

## 🏃‍♂️ Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/ar-generator-react.git
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure environment**
    Create a `.env` file based on `.env.example` and add your Gemini API key:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

## ☕ Support

This project is open-source and free to use! If you find it helpful, please consider supporting its development.

You can access the donation page through **Settings → Support** in the application, where you'll find QR codes for:
- **Maribank** - User
- **Landbank** - User

Your support helps keep this project maintained and actively developed. Thank you! ❤️

## 📝 License

This project is licensed under the MIT License.

