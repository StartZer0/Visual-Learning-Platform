import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Link, Save, Loader2, Type
} from 'lucide-react';
import apiService from '../../services/api';
import Button from './Button';

const SimpleRichTextEditor = ({
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
  const editorRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveTimeoutRef = useRef(null);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Handle content change
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;

    const content = editorRef.current.innerHTML;
    console.log('📝 Content changed, new value:', content);
    onChange?.(content);

    // Auto-save functionality
    if (autoSave && onSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('💾 Auto-saving content:', content);
          setIsSaving(true);
          await onSave(content);
          setLastSaved(new Date());
          console.log('✅ Auto-save completed');
        } catch (error) {
          console.error('❌ Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }, autoSaveDelay);
    }
  }, [onChange, onSave, autoSave, autoSaveDelay]);

  // Format text
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  // Insert image
  const handleImageUpload = async () => {
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
        console.log('🔄 Starting image upload for file:', file.name);
        const uploadResult = await apiService.uploadImage(file);
        console.log('✅ Image upload result:', uploadResult);

        const imageUrl = apiService.getFileUrl(uploadResult.filename);
        console.log('🔗 Generated image URL:', imageUrl);

        // Insert image into editor
        const img = `<img src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 8px 0; border-radius: 4px;" />`;
        console.log('📝 Inserting image HTML:', img);

        document.execCommand('insertHTML', false, img);
        handleContentChange();

        // Log the current editor content after image insertion
        console.log('📄 Editor content after image insertion:', editorRef.current.innerHTML);

        console.log('✅ Image uploaded successfully:', uploadResult.filename);
      } catch (error) {
        console.error('Image upload failed:', error);
        alert(`Failed to upload image: ${error.message}`);
      } finally {
        setIsUploading(false);
      }
    };
  };

  // Insert link
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      formatText('createLink', url);
    }
  };

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

  return (
    <div className={`simple-rich-text-editor ${className}`}>
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

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-t-lg">
        {/* Text Formatting */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('bold')}
          icon={<Bold className="h-4 w-4" />}
          title="Bold (Ctrl+B)"
          disabled={disabled}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('italic')}
          icon={<Italic className="h-4 w-4" />}
          title="Italic (Ctrl+I)"
          disabled={disabled}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('underline')}
          icon={<Underline className="h-4 w-4" />}
          title="Underline (Ctrl+U)"
          disabled={disabled}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('strikeThrough')}
          icon={<Strikethrough className="h-4 w-4" />}
          title="Strikethrough"
          disabled={disabled}
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Lists */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('insertUnorderedList')}
          icon={<List className="h-4 w-4" />}
          title="Bullet List"
          disabled={disabled}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('insertOrderedList')}
          icon={<ListOrdered className="h-4 w-4" />}
          title="Numbered List"
          disabled={disabled}
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Alignment */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('justifyLeft')}
          icon={<AlignLeft className="h-4 w-4" />}
          title="Align Left"
          disabled={disabled}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('justifyCenter')}
          icon={<AlignCenter className="h-4 w-4" />}
          title="Align Center"
          disabled={disabled}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('justifyRight')}
          icon={<AlignRight className="h-4 w-4" />}
          title="Align Right"
          disabled={disabled}
        />

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Media & Links */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImageUpload}
          icon={<ImageIcon className="h-4 w-4" />}
          title="Insert Image"
          disabled={disabled || isUploading}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={insertLink}
          icon={<Link className="h-4 w-4" />}
          title="Insert Link"
          disabled={disabled}
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleContentChange}
        className="w-full p-4 border border-t-0 border-gray-300 dark:border-gray-600 rounded-b-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent overflow-y-auto"
        style={{
          height: height,
          minHeight: '200px'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

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
          <span>• Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline)</span>
          {autoSave && <span>• Auto-saves every {autoSaveDelay / 1000}s</span>}
        </div>
      </div>
    </div>
  );
};

export default SimpleRichTextEditor;
