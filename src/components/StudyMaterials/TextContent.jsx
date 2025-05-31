import React, { useState } from 'react';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';
import MathText from '../UI/MathText';
import SimpleRichTextEditor from '../UI/SimpleRichTextEditor';
import apiService from '../../services/api';

const TextContent = ({ material }) => {
  const { state, dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(material.content);
  const [editTitle, setEditTitle] = useState(material.title);

  const handleSave = async (content = editContent) => {
    try {
      console.log('💾 TextContent: Saving content:', content);
      const updatedMaterial = {
        ...material,
        title: editTitle,
        content: content,
        lastModified: new Date().toISOString(),
      };

      console.log('📊 TextContent: Updated material object:', updatedMaterial);
      console.log('🚀 TextContent: Dispatching UPDATE_STUDY_MATERIAL');
      dispatch({
        type: 'UPDATE_STUDY_MATERIAL',
        payload: updatedMaterial,
      });

      setIsEditing(false);
      return true;
    } catch (error) {
      console.error('❌ TextContent: Failed to save content:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    setEditContent(material.content);
    setEditTitle(material.title);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this text content?')) {
      dispatch({ type: 'DELETE_STUDY_MATERIAL', payload: material.id });
    }
  };

  return (
    <div className="panel">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 mr-4 px-2 py-1 text-sm font-medium bg-transparent border border-gray-300 dark:border-gray-600 rounded"
            placeholder="Enter title..."
          />
        ) : (
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {material.title}
          </h3>
        )}

        <div className="flex items-center space-x-1">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                icon={<Save className="h-4 w-4" />}
                title="Save changes"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                icon={<X className="h-4 w-4" />}
                title="Cancel editing"
              />
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                icon={<Edit2 className="h-4 w-4" />}
                title="Edit content"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                icon={<Trash2 className="h-4 w-4" />}
                className="text-red-600 hover:text-red-700"
                title="Delete content"
              />
            </>
          )}
        </div>
      </div>

      <div className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            <SimpleRichTextEditor
              value={editContent}
              onChange={setEditContent}
              onSave={handleSave}
              placeholder="Start writing your content here..."
              height="400px"
              autoSave={true}
              autoSaveDelay={3000}
              showSaveButton={false}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="font-medium mb-1">💡 Rich Text Features:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                <span>• Bold, italic, underline formatting</span>
                <span>• Bullet points and numbered lists</span>
                <span>• Text colors and highlighting</span>
                <span>• Image upload and embedding</span>
                <span>• Links and code blocks</span>
                <span>• Auto-save every 3 seconds</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {material.content ? (
              <div
                className="rich-text-content"
                dangerouslySetInnerHTML={{ __html: material.content }}
              />
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic text-center py-8">
                <div className="mb-2">📝 No content yet</div>
                <div className="text-sm">Click edit to add rich text content with images and formatting</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextContent;
