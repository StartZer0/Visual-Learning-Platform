import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';

const EditablePDFTitle = ({ material }) => {
  const { dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(material.displayName || material.title);
  const inputRef = useRef(null);

  // Clean filename by removing UUID prefix
  const cleanFilename = (filename) => {
    // Remove UUID pattern (8-4-4-4-12 characters) and following dash
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i;
    return filename.replace(uuidPattern, '');
  };

  // Get display name, preferring custom displayName over cleaned title
  const getDisplayName = () => {
    if (material.displayName && material.displayName !== material.title) {
      return material.displayName;
    }
    return cleanFilename(material.title);
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditValue(getDisplayName());
  };

  const saveEdit = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== getDisplayName()) {
      const updatedMaterial = {
        ...material,
        displayName: trimmedValue
      };
      dispatch({ type: 'UPDATE_STUDY_MATERIAL', payload: updatedMaterial });
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(getDisplayName());
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Reset edit value when material changes
  useEffect(() => {
    setEditValue(getDisplayName());
  }, [material.displayName, material.title]);

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Enter PDF title..."
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={saveEdit}
          icon={<Check className="h-3 w-3" />}
          className="p-1 h-6 w-6 text-green-600 hover:text-green-700"
          title="Save title"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={cancelEdit}
          icon={<X className="h-3 w-3" />}
          className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
          title="Cancel editing"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 flex-1 min-w-0 group">
      <h3 
        className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate flex-1 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        onClick={startEditing}
        title={`Click to edit: ${getDisplayName()}`}
      >
        {getDisplayName()}
      </h3>
      <Button
        variant="ghost"
        size="sm"
        onClick={startEditing}
        icon={<Edit2 className="h-3 w-3" />}
        className="p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Edit title"
      />
    </div>
  );
};

export default EditablePDFTitle;
