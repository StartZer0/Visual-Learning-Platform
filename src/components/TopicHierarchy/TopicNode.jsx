import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, FolderOpen, Folder } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { generateId } from '../../utils/helpers';
import Button from '../UI/Button';

const TopicNode = ({ topic, level = 0 }) => {
  const { state, dispatch } = useApp();
  const [isExpanded, setIsExpanded] = useState(topic.expanded || false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(topic.title);

  const hasChildren = topic.children && topic.children.length > 0;
  const isSelected = state.currentTopic?.id === topic.id;

  const handleToggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    dispatch({
      type: 'UPDATE_TOPIC',
      payload: { ...topic, expanded: newExpanded }
    });
  };

  const handleAddSubtopic = () => {
    const newSubtopic = {
      id: generateId(),
      title: 'New Subtopic',
      children: [],
      expanded: false,
      parentId: topic.id,
    };

    const updatedTopic = {
      ...topic,
      children: [...(topic.children || []), newSubtopic],
      expanded: true,
    };

    dispatch({ type: 'UPDATE_TOPIC', payload: updatedTopic });
    setIsExpanded(true);
  };

  const handleEdit = () => {
    if (isEditing) {
      dispatch({
        type: 'UPDATE_TOPIC',
        payload: { ...topic, title: editTitle }
      });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${topic.title}" and all its subtopics?`)) {
      dispatch({ type: 'DELETE_TOPIC', payload: topic.id });
    }
  };

  const handleSelect = () => {
    dispatch({ type: 'SET_CURRENT_TOPIC', payload: topic });
  };

  const indentLevel = level * 20;

  return (
    <div className="select-none">
      <div
        className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors duration-200 ${
          isSelected
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        style={{ marginLeft: `${indentLevel}px` }}
        onClick={handleSelect}
      >
        <div className="flex items-center flex-1 min-w-0">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpand();
              }}
              className="mr-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          <div className="mr-2">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-primary-600" />
              ) : (
                <Folder className="h-4 w-4 text-primary-600" />
              )
            ) : (
              <div className="h-4 w-4" />
            )}
          </div>

          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEdit();
                if (e.key === 'Escape') {
                  setEditTitle(topic.title);
                  setIsEditing(false);
                }
              }}
              className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 text-sm font-medium truncate">
              {topic.title}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAddSubtopic();
            }}
            icon={<Plus className="h-3 w-3" />}
            className="p-1 h-6 w-6"
            title="Add subtopic"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            icon={<Edit2 className="h-3 w-3" />}
            className="p-1 h-6 w-6"
            title="Edit topic"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            icon={<Trash2 className="h-3 w-3" />}
            className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
            title="Delete topic"
          />
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-4">
          {topic.children.map((child) => (
            <TopicNode key={child.id} topic={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicNode;
