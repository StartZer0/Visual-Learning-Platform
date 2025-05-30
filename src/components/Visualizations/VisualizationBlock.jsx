import React, { useState, useEffect, useRef } from 'react';
import { Play, Edit2, Save, X, Trash2, ChevronUp, ChevronDown, Code, Eye } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';
import CodeEditor from './CodeEditor';

const VisualizationBlock = ({ visualization, index, total }) => {
  const { state, dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(visualization.title);
  const [editCode, setEditCode] = useState(visualization.code);
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (!isEditing && visualization.code) {
      executeCode();
    }
  }, [visualization.code, isEditing]);

  const executeCode = () => {
    if (!previewRef.current) return;

    try {
      setError(null);

      // Clear previous content
      previewRef.current.innerHTML = '';

      // Create a sandboxed iframe for code execution
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '300px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';

      previewRef.current.appendChild(iframe);

      // Write the HTML content to the iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              margin: 0;
              padding: 16px;
              font-family: system-ui, sans-serif;
              background: white;
            }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
          ${visualization.code}
        </body>
        </html>
      `;

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

    } catch (err) {
      setError(err.message);
      console.error('Error executing visualization code:', err);
    }
  };

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_VISUALIZATION',
      payload: {
        ...visualization,
        title: editTitle,
        code: editCode,
      },
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(visualization.title);
    setEditCode(visualization.code);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this visualization?')) {
      dispatch({ type: 'DELETE_VISUALIZATION', payload: visualization.id });
    }
  };

  const handleMoveUp = () => {
    if (index > 0) {
      const visualizations = [...state.visualizations];
      [visualizations[index], visualizations[index - 1]] = [visualizations[index - 1], visualizations[index]];
      dispatch({ type: 'REORDER_VISUALIZATIONS', payload: visualizations });
    }
  };

  const handleMoveDown = () => {
    if (index < total - 1) {
      const visualizations = [...state.visualizations];
      [visualizations[index], visualizations[index + 1]] = [visualizations[index + 1], visualizations[index]];
      dispatch({ type: 'REORDER_VISUALIZATIONS', payload: visualizations });
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
            {visualization.title}
          </h3>
        )}

        <div className="flex items-center space-x-1">
          {!isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCode(!showCode)}
                icon={showCode ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
                title={showCode ? 'Show preview' : 'Show code'}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={executeCode}
                icon={<Play className="h-4 w-4" />}
                title="Run code"
              />
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMoveUp}
                disabled={index === 0}
                icon={<ChevronUp className="h-4 w-4" />}
                title="Move up"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMoveDown}
                disabled={index === total - 1}
                icon={<ChevronDown className="h-4 w-4" />}
                title="Move down"
              />
            </>
          )}

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
                title="Edit visualization"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                icon={<Trash2 className="h-4 w-4" />}
                className="text-red-600 hover:text-red-700"
                title="Delete visualization"
              />
            </>
          )}
        </div>
      </div>

      <div className="p-4">
        {isEditing || showCode ? (
          <div className="space-y-4">
            <CodeEditor
              value={editCode}
              onChange={setEditCode}
              language="html"
              height="300px"
              readOnly={!isEditing}
            />
            {isEditing && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="text-red-800 dark:text-red-200 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            ) : (
              <div
                ref={previewRef}
                className="min-h-[200px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualizationBlock;
