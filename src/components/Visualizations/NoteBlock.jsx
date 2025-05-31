import React, { useState } from 'react';
import { Edit2, Trash2, Save, X, StickyNote } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';
import SimpleRichTextEditor from '../UI/SimpleRichTextEditor';
import apiService from '../../services/api';

const NoteBlock = ({ note, index, total }) => {
  const { state, dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(true);
  };

  const handleSave = async (content = editContent) => {
    try {
      setIsSaving(true);

      const updatedNote = {
        ...note,
        title: editTitle,
        content: content,
        lastModified: new Date().toISOString(),
      };

      // Update the state first
      dispatch({
        type: 'UPDATE_VISUALIZATION_NOTE',
        payload: updatedNote,
      });

      // Manually save to backend with the updated state to ensure immediate persistence
      try {
        const backendAvailable = await apiService.checkHealth();
        if (backendAvailable) {
          // Create updated state with the new note
          const updatedVisualizationNotes = state.visualizationNotes.map(n =>
            n.id === updatedNote.id ? updatedNote : n
          );

          const stateToSave = {
            ...state,
            visualizationNotes: updatedVisualizationNotes,
            studyMaterials: state.studyMaterials.map(material => {
              if (material.type === 'pdf') {
                // For PDFs, save metadata but not blob URLs
                const { url, file, ...cleanMaterial } = material;
                return cleanMaterial;
              }
              return material;
            })
          };

          await apiService.saveState(stateToSave);
          console.log('Note saved to backend immediately');
        }
      } catch (backendError) {
        console.warn('Failed to save to backend:', backendError);
      }

      setIsEditing(false);
      return true;
    } catch (error) {
      console.error('Failed to save note:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      dispatch({ type: 'DELETE_VISUALIZATION_NOTE', payload: note.id });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
        <div className="flex items-center space-x-2">
          <StickyNote className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 px-2 py-1 text-sm font-medium bg-transparent border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter note title..."
            />
          ) : (
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {note.title}
            </h3>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSave()}
                disabled={isSaving}
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
                onClick={handleEdit}
                icon={<Edit2 className="h-4 w-4" />}
                title="Edit note"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                icon={<Trash2 className="h-4 w-4" />}
                className="text-red-600 hover:text-red-700"
                title="Delete note"
              />
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            <SimpleRichTextEditor
              value={editContent}
              onChange={setEditContent}
              onSave={handleSave}
              placeholder="Start writing your note here..."
              height="300px"
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
            {note.content ? (
              <div
                className="rich-text-content"
                dangerouslySetInnerHTML={{ __html: note.content }}
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

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Note {index + 1} of {total}</span>
          <div className="flex items-center space-x-4">
            <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
            {note.lastModified && note.lastModified !== note.createdAt && (
              <span>Modified: {new Date(note.lastModified).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteBlock;
