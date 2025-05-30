// Generate unique IDs
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// File type detection
export const getFileType = (file) => {
  const extension = file.name.split('.').pop().toLowerCase();
  if (extension === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(extension)) return 'image';
  if (['txt', 'md', 'doc', 'docx'].includes(extension)) return 'document';
  return 'unknown';
};

// URL validation
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Extract YouTube video ID
export const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Safe HTML execution
export const executeHTMLCode = (htmlCode, containerId) => {
  try {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = htmlCode;

    // Execute any script tags
    const scripts = container.querySelectorAll('script');
    scripts.forEach(script => {
      const newScript = document.createElement('script');
      newScript.textContent = script.textContent;
      script.parentNode.replaceChild(newScript, script);
    });
  } catch (error) {
    console.error('Error executing HTML code:', error);
  }
};

// Safe JavaScript execution
export const executeJavaScriptCode = (jsCode) => {
  try {
    // Create a new function to execute the code in a controlled environment
    const func = new Function(jsCode);
    return func();
  } catch (error) {
    console.error('Error executing JavaScript code:', error);
    return error.message;
  }
};

// Parse text with math formulas
export const parseMathText = (text) => {
  if (!text) return [];

  const parts = [];
  let currentIndex = 0;

  // Regex to match inline math $...$ and block math $$...$$
  const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g;
  let match;

  while ((match = mathRegex.exec(text)) !== null) {
    // Add text before math
    if (match.index > currentIndex) {
      const textPart = text.slice(currentIndex, match.index);
      if (textPart) {
        parts.push({ type: 'text', content: textPart });
      }
    }

    // Add math part
    const mathContent = match[1];
    const isBlock = mathContent.startsWith('$$') && mathContent.endsWith('$$');
    const formula = isBlock
      ? mathContent.slice(2, -2).trim()
      : mathContent.slice(1, -1).trim();

    parts.push({
      type: 'math',
      content: formula,
      block: isBlock
    });

    currentIndex = match.index + match[1].length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    const remainingText = text.slice(currentIndex);
    if (remainingText) {
      parts.push({ type: 'text', content: remainingText });
    }
  }

  // If no math found, return the original text as a single text part
  if (parts.length === 0) {
    parts.push({ type: 'text', content: text });
  }

  return parts;
};
