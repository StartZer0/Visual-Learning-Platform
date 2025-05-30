#!/bin/bash

# Create a desktop shortcut for Visual Learning Platform

echo "🔗 Creating desktop shortcut for Visual Learning Platform..."

# Get current directory
CURRENT_DIR="$(pwd)"
APP_PATH="$CURRENT_DIR/Visual Learning Platform.app"
DESKTOP_PATH="$HOME/Desktop"

# Check if the app exists
if [ ! -d "$APP_PATH" ]; then
    echo "❌ Visual Learning Platform.app not found in current directory"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Create symbolic link on desktop
if [ -d "$DESKTOP_PATH" ]; then
    SHORTCUT_PATH="$DESKTOP_PATH/Visual Learning Platform.app"
    
    # Remove existing shortcut if it exists
    if [ -L "$SHORTCUT_PATH" ]; then
        rm "$SHORTCUT_PATH"
        echo "🗑️  Removed existing shortcut"
    fi
    
    # Create new symbolic link
    ln -s "$APP_PATH" "$SHORTCUT_PATH"
    
    if [ $? -eq 0 ]; then
        echo "✅ Desktop shortcut created successfully!"
        echo "📍 Location: $SHORTCUT_PATH"
        echo ""
        echo "🎯 You can now double-click the app on your desktop to launch Visual Learning Platform!"
    else
        echo "❌ Failed to create desktop shortcut"
        exit 1
    fi
else
    echo "❌ Desktop directory not found: $DESKTOP_PATH"
    exit 1
fi

echo ""
echo "🚀 Quick Start:"
echo "1. Double-click 'Visual Learning Platform' on your desktop"
echo "2. Wait for Terminal to open and servers to start"
echo "3. Browser will automatically open to http://localhost:3000"
echo "4. Create topics and upload PDFs - they'll be saved permanently!"
echo ""
echo "📁 Your files are stored in: $CURRENT_DIR/backend/uploads/"
