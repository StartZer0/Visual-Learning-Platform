import React, { useState } from 'react';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';
import MathText from '../UI/MathText';

const TextContent = ({ material }) => {
  const { dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(material.content);
  const [editTitle, setEditTitle] = useState(material.title);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_STUDY_MATERIAL',
      payload: {
        ...material,
        title: editTitle,
        content: editContent,
      },
    });
    setIsEditing(false);
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
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your text content here..."
            />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              💡 <strong>Math formulas:</strong> Use $formula$ for inline math (e.g., $E = mc^2$) or $$formula$$ for block math (e.g., $$KE = \frac{1}{2}mv^2$$)
            </div>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {material.content ? (
              <MathText className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                {material.content}
              </MathText>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic">
                No content yet. Click edit to add content.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextContent;
