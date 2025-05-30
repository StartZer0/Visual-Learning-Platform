# 🚀 Visual Learning Platform - Mac Setup Guide

## 📋 Prerequisites

Before setting up the Visual Learning Platform, make sure you have:

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Or install via Homebrew: `brew install node`

2. **Git** (usually pre-installed on Mac)
   - Check with: `git --version`

## 🛠️ Installation Steps

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies

```bash
cd ..  # Go back to project root
npm install
```

### Step 3: Make the Launcher Executable

```bash
chmod +x launcher/start-learning-platform.sh
chmod +x "Visual Learning Platform.app/Contents/MacOS/Visual Learning Platform"
```

## 🎯 How to Use

### Option 1: Double-Click the App (Recommended)

1. **Double-click** the `Visual Learning Platform.app` in Finder
2. This will open Terminal and automatically start both servers
3. Your browser will open to `http://localhost:3000`
4. Start uploading PDFs - they'll be saved permanently!

### Option 2: Manual Launch

1. Open Terminal
2. Navigate to the project directory
3. Run: `./launcher/start-learning-platform.sh`

## 📁 File Storage

- **PDFs**: Stored in `backend/uploads/`
- **App State**: Saved in `backend/data/app-state.json`
- **Persistent**: Files survive browser refresh and computer restart

## 🔧 Ports Used

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 🎉 Features

✅ **Persistent PDF Storage** - Upload once, access forever
✅ **Topic Organization** - Organize your study materials
✅ **Visual Learning** - Interactive diagrams and visualizations
✅ **Math Support** - LaTeX formula rendering
✅ **Dark/Light Mode** - Comfortable studying any time
✅ **Responsive Design** - Works on all screen sizes

## 🛑 Stopping the Platform

- Press `Ctrl+C` in the Terminal window to stop both servers
- Or simply close the Terminal window

## 🔍 Troubleshooting

### Backend Won't Start
- Check if port 3001 is already in use: `lsof -i :3001`
- Kill existing process: `kill -9 $(lsof -ti :3001)`

### Frontend Won't Start
- Check if port 3000 is already in use: `lsof -i :3000`
- Kill existing process: `kill -9 $(lsof -ti :3000)`

### PDFs Not Persisting
- Make sure the backend server is running (green checkmark in console)
- Check `backend/uploads/` folder exists and has write permissions

### App Won't Launch
- Make sure the launcher script is executable: `chmod +x launcher/start-learning-platform.sh`
- Try running manually from Terminal first

## 📞 Support

If you encounter any issues:

1. Check the Terminal output for error messages
2. Ensure Node.js is properly installed: `node --version`
3. Verify all dependencies are installed: `npm list` in both root and backend directories

## 🎯 Quick Start

1. **Double-click** `Visual Learning Platform.app`
2. **Create a topic** using the "+" button in the Topics sidebar
3. **Select the topic** by clicking on it
4. **Upload a PDF** using the "Upload PDF" button
5. **Start studying** - your PDF is now permanently saved!

---

**🎓 Happy Learning!** Your PDFs will now persist across all sessions, making this a true personal study platform.
