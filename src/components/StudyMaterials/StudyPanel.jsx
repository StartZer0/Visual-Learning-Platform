import React, { useState } from 'react';
import { Plus, FileText, Link, Upload } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { generateId } from '../../utils/helpers';
import apiService from '../../services/api';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import SimpleRichTextEditor from '../UI/SimpleRichTextEditor';
import PDFViewer from './PDFViewer';
import TextContent from './TextContent';
import LinkContent from './LinkContent';

const StudyPanel = () => {
  const { state, dispatch } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemType, setNewItemType] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');

  // Alternative upload method
  const triggerFileUpload = () => {
    const input = document.getElementById('pdf-upload-input');
    if (input) {
      input.click();
    }
  };

  const currentTopicMaterials = state.studyMaterials.filter(
    material => material.topicId === state.currentTopic?.id
  );

  const handleAddItem = (type) => {
    setNewItemType(type);
    setNewItemTitle('');
    setNewItemContent('');
    setNewItemUrl('');
    setShowAddModal(true);
  };

  const handleSaveItem = () => {
    if (!state.currentTopic) {
      alert('Please select a topic first');
      return;
    }

    const newItem = {
      id: generateId(),
      topicId: state.currentTopic.id,
      type: newItemType,
      title: newItemTitle || `New ${newItemType}`,
      createdAt: new Date().toISOString(),
    };

    if (newItemType === 'text') {
      newItem.content = newItemContent;
      console.log('💾 StudyPanel: Saving new text content:', newItemContent);
      console.log('📊 StudyPanel: New item object:', newItem);
    } else if (newItemType === 'link') {
      newItem.url = newItemUrl;
    }

    console.log('🚀 StudyPanel: Dispatching ADD_STUDY_MATERIAL with:', newItem);
    dispatch({ type: 'ADD_STUDY_MATERIAL', payload: newItem });
    setShowAddModal(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!state.currentTopic) {
      alert('Please select a topic first from the Topics sidebar on the left');
      return;
    }

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        const materialId = generateId();

        // Check if backend is available
        const backendAvailable = await apiService.checkHealth();

        let fileUrl, isPersistent, filename;

        if (backendAvailable) {
          // Upload to backend for persistent storage
          try {
            const uploadResult = await apiService.uploadFile(file, materialId);
            fileUrl = apiService.getFileUrl(uploadResult.filename);
            filename = uploadResult.filename;
            isPersistent = true;
            console.log('PDF uploaded to backend:', file.name);
          } catch (backendError) {
            console.warn('Backend upload failed, using fallback:', backendError);
            fileUrl = URL.createObjectURL(file);
            isPersistent = false;
          }
        } else {
          // Fallback to blob URL if backend not available
          console.warn('Backend not available, using blob URL');
          fileUrl = URL.createObjectURL(file);
          isPersistent = false;
        }

        const newPDF = {
          id: materialId,
          topicId: state.currentTopic.id,
          type: 'pdf',
          title: file.name, // Original filename
          displayName: file.name, // Editable display name
          url: fileUrl,
          filename: filename, // Store backend filename if available
          isPersistent: isPersistent,
          needsReupload: !isPersistent,
          createdAt: new Date().toISOString(),
        };

        dispatch({ type: 'ADD_STUDY_MATERIAL', payload: newPDF });

        if (isPersistent) {
          alert(`✅ PDF "${file.name}" uploaded successfully and saved permanently!`);
        } else {
          alert(`⚠️ PDF "${file.name}" uploaded (will need re-upload after refresh - start backend for permanent storage)`);
        }
      } catch (error) {
        console.error('Error uploading PDF:', error);
        alert('Failed to upload PDF file. Please try again.');
      }
    } else {
      alert(`File type "${file.type}" is not supported. Only PDF files are allowed.`);
    }

    // Reset the input
    event.target.value = '';
  };

  const renderMaterial = (material) => {
    switch (material.type) {
      case 'pdf':
        return <PDFViewer key={material.id} material={material} />;
      case 'text':
        return <TextContent key={material.id} material={material} />;
      case 'link':
        return <LinkContent key={material.id} material={material} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Study Materials
        </h2>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="pdf-upload-input"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={triggerFileUpload}
            icon={<Upload className="h-4 w-4" />}
            title="Upload PDF file"
          >
            Upload PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddItem('text')}
            icon={<FileText className="h-4 w-4" />}
          >
            Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddItem('link')}
            icon={<Link className="h-4 w-4" />}
          >
            Link
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!state.currentTopic ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              📁 Select a topic to view and add study materials
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              {state.topics.length === 0 ? (
                <>
                  First create a topic using the "+" button in the Topics sidebar on the left
                </>
              ) : (
                <>
                  Choose from {state.topics.length} available topic{state.topics.length !== 1 ? 's' : ''} in the sidebar
                </>
              )}
            </div>
            {state.topics.length === 0 && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg inline-block">
                💡 Tip: Click the "Topics" button in the header to show the sidebar if it's hidden
              </div>
            )}
          </div>
        ) : currentTopicMaterials.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              No study materials yet for "{state.currentTopic.title}"
            </div>
            <div className="flex justify-center space-x-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  icon={<Upload className="h-4 w-4" />}
                  as="span"
                >
                  Upload PDF
                </Button>
              </label>
              <Button
                variant="outline"
                onClick={() => handleAddItem('text')}
                icon={<FileText className="h-4 w-4" />}
              >
                Add Text
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddItem('link')}
                icon={<Link className="h-4 w-4" />}
              >
                Add Link
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {currentTopicMaterials.map(renderMaterial)}
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add ${newItemType === 'text' ? 'Text Content' : 'Link'}`}
        size={newItemType === 'text' ? 'xl' : 'md'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              className="input-field"
              placeholder={`Enter ${newItemType} title...`}
            />
          </div>

          {newItemType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <SimpleRichTextEditor
                value={newItemContent}
                onChange={setNewItemContent}
                placeholder="Start writing your content here..."
                height="300px"
                showSaveButton={false}
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                💡 Use the toolbar for formatting, colors, lists, and image uploads
              </div>
            </div>
          )}

          {newItemType === 'link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL
              </label>
              <input
                type="url"
                value={newItemUrl}
                onChange={(e) => setNewItemUrl(e.target.value)}
                className="input-field"
                placeholder="https://example.com"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveItem}
              disabled={
                !newItemTitle ||
                (newItemType === 'link' && !newItemUrl)
              }
            >
              Add {newItemType === 'text' ? 'Text' : 'Link'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudyPanel;
