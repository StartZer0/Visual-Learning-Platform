import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Upload, Image as ImageIcon, Save, Loader2 } from 'lucide-react';
import apiService from '../../services/api';
import Button from './Button';

const RichTextEditor = ({
  value = '',
  onChange,
  onSave,
  placeholder = 'Start typing...',
  autoSave = false,
  autoSaveDelay = 2000,
  className = '',
  height = '300px',
  showSaveButton = true,
  disabled = false
}) => {
  const quillRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveTimeoutRef = useRef(null);

  // Custom toolbar configuration
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: handleImageUpload
      }
    },
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  // Handle image upload
  async function handleImageUpload() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
      }

      setIsUploading(true);
      try {
        // Check if backend is available
        const backendAvailable = await apiService.checkHealth();
        if (!backendAvailable) {
          throw new Error('Backend not available. Please start the backend server.');
        }

        // Upload image to backend
        const uploadResult = await apiService.uploadImage(file);
        const imageUrl = apiService.getFileUrl(uploadResult.filename);

        // Insert image into editor
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection();
          const index = range ? range.index : quill.getLength();
          quill.insertEmbed(index, 'image', imageUrl);
          quill.setSelection(index + 1);
        }

        console.log('Image uploaded successfully:', uploadResult.filename);
      } catch (error) {
        console.error('Image upload failed:', error);
        alert(`Failed to upload image: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    };
  }

  // Handle content change
  const handleChange = useCallback((content, delta, source, editor) => {
    onChange?.(content);

    // Auto-save functionality
    if (autoSave && onSave && source === 'user') {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          setIsSaving(true);
          await onSave(content);
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }, autoSaveDelay);
    }
  }, [onChange, onSave, autoSave, autoSaveDelay]);

  // Manual save
  const handleSave = async () => {
    if (!onSave) return;

    try {
      setIsSaving(true);
      await onSave(value);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Custom styles for dark theme support
  const editorStyle = {
    height: height,
    backgroundColor: 'var(--editor-bg, white)',
    color: 'var(--editor-text, black)'
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar Status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {isUploading && (
            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              Uploading image...
            </div>
          )}
          {isSaving && (
            <div className="flex items-center text-sm text-green-600 dark:text-green-400">
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              Saving...
            </div>
          )}
          {lastSaved && !isSaving && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </div>

        {showSaveButton && onSave && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || disabled}
            icon={isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>

      {/* Rich Text Editor */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          style={editorStyle}
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm text-blue-800 dark:text-blue-200">
              Uploading image to server...
            </span>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex flex-wrap gap-4">
          <span>• Use the toolbar for formatting</span>
          <span>• Click image icon to upload images</span>
          <span>• Supports drag & drop for images</span>
          {autoSave && <span>• Auto-saves every {autoSaveDelay / 1000}s</span>}
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
