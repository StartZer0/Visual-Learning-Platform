import React, { useState } from 'react';
import { ExternalLink, Edit2, Save, X, Trash2, Play } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getYouTubeVideoId } from '../../utils/helpers';
import Button from '../UI/Button';

const LinkContent = ({ material }) => {
  const { dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(material.url);
  const [editTitle, setEditTitle] = useState(material.title);

  const isYouTube = getYouTubeVideoId(material.url) !== null;
  const youtubeVideoId = getYouTubeVideoId(material.url);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_STUDY_MATERIAL',
      payload: {
        ...material,
        title: editTitle,
        url: editUrl,
      },
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditUrl(material.url);
    setEditTitle(material.title);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      dispatch({ type: 'DELETE_STUDY_MATERIAL', payload: material.id });
    }
  };

  const handleOpenLink = () => {
    window.open(material.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="panel">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {isEditing ? (
          <div className="flex-1 mr-4 space-y-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-2 py-1 text-sm font-medium bg-transparent border border-gray-300 dark:border-gray-600 rounded"
              placeholder="Enter title..."
            />
            <input
              type="url"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-transparent border border-gray-300 dark:border-gray-600 rounded"
              placeholder="Enter URL..."
            />
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {material.title}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {material.url}
            </p>
          </div>
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
                onClick={handleOpenLink}
                icon={<ExternalLink className="h-4 w-4" />}
                title="Open link"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                icon={<Edit2 className="h-4 w-4" />}
                title="Edit link"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                icon={<Trash2 className="h-4 w-4" />}
                className="text-red-600 hover:text-red-700"
                title="Delete link"
              />
            </>
          )}
        </div>
      </div>

      <div className="p-4">
        {isYouTube && youtubeVideoId ? (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeVideoId}`}
              title={material.title}
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="text-center">
              <ExternalLink className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                External Link
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenLink}
                icon={<ExternalLink className="h-4 w-4" />}
              >
                Open Link
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkContent;
