# Visual Learning Platform

A responsive web-based interactive learning platform that allows users to create hierarchical topic structures, manage study materials, and build interactive visualizations with live code execution.

## Features

### 🏗️ Hierarchical Topic Organization
- Create main topics, subtopics, and sub-subtopics
- Tree-like navigation with expand/collapse functionality
- Easy topic management with add, edit, and delete operations

### 📚 Study Materials Panel (Left Panel)
- **PDF Upload & Viewer**: Upload and view PDF files with zoom, navigation controls
- **Text Content**: Add and edit rich text content
- **External Links**: Add YouTube videos, websites, and other external resources

### 🎨 Interactive Visualizations Panel (Right Panel)
- **Live Code Editor**: Monaco Editor with syntax highlighting
- **Real-time Preview**: Execute HTML/CSS/JavaScript code instantly
- **Multiple Visualizations**: Stack multiple code blocks per topic
- **Reordering Controls**: Move visualizations up/down with arrow buttons

### 🎯 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Resizable Panels**: Adjust panel sizes or hide/show panels
- **Save/Load**: Export and import learning modules as JSON files
- **Local Storage**: Automatic saving of work in progress

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Deployment to Netlify

This project is configured for easy deployment to Netlify:

1. Connect your repository to Netlify
2. The build settings are automatically configured via `netlify.toml`
3. Deploy with build command: `npm run build` and publish directory: `dist`

## Usage Guide

### Creating Your First Learning Module

1. **Add a Topic**: Click "Add Topic" to create your first main topic
2. **Add Study Materials**: Select a topic and add PDFs, text, or links in the left panel
3. **Create Visualizations**: Add interactive HTML/CSS/JavaScript visualizations in the right panel
4. **Save Your Work**: Use the "Save" button to export your learning module

## Technology Stack

- **Frontend**: React 19, Tailwind CSS
- **Code Editor**: Monaco Editor (VS Code editor)
- **PDF Handling**: react-pdf
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Netlify
