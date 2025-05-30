import React, { useState, useEffect } from 'react';
import { StickyNote, ChevronDown, ChevronUp, Save, Trash2, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { generateId } from '../../utils/helpers';
import Button from '../UI/Button';
import RichTextEditor from '../UI/RichTextEditor';
import apiService from '../../services/api';

const NotesPanel = () => {
  const { state, dispatch } = useApp();
  const [isExpanded, setIsExpanded] = useState(true);
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Load notes from state
  useEffect(() => {
    const savedNotes = state.visualizationNotes || [];
    setNotes(savedNotes);
    if (savedNotes.length > 0 && !activeNoteId) {
      setActiveNoteId(savedNotes[0].id);
    }
  }, [state.visualizationNotes, activeNoteId]);

  // Save notes to state and backend
  const saveNotes = async (updatedNotes) => {
    try {
      dispatch({
        type: 'SET_VISUALIZATION_NOTES',
        payload: updatedNotes
      });

      // Save to backend if available
      try {
        const backendAvailable = await apiService.checkHealth();
        if (backendAvailable) {
          const currentState = { ...state, visualizationNotes: updatedNotes };
          await apiService.saveState(currentState);
        }
      } catch (backendError) {
        console.warn('Failed to save notes to backend:', backendError);
      }

      return true;
    } catch (error) {
      console.error('Failed to save notes:', error);
      throw error;
    }
  };

  // Create new note
  const createNote = () => {
    const newNote = {
      id: generateId(),
      title: 'New Note',
      content: '',
      topicId: state.currentTopic?.id || null,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    setActiveNoteId(newNote.id);
    setIsCreating(true);
    saveNotes(updatedNotes);
  };

  // Update note content
  const updateNote = async (noteId, updates) => {
    const updatedNotes = notes.map(note =>
      note.id === noteId
        ? { ...note, ...updates, lastModified: new Date().toISOString() }
        : note
    );
    
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
  };

  // Delete note
  const deleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      
      if (activeNoteId === noteId) {
        setActiveNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
      }
      
      saveNotes(updatedNotes);
    }
  };

  // Get active note
  const activeNote = notes.find(note => note.id === activeNoteId);

  // Filter notes by current topic if available
  const filteredNotes = state.currentTopic
    ? notes.filter(note => note.topicId === state.currentTopic.id || note.topicId === null)
    : notes;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <StickyNote className="h-4 w-4" />
          <span>Notes</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {isExpanded && (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={createNote}
              icon={<Plus className="h-3 w-3" />}
              title="Create new note"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex h-96">
          {/* Notes List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <div className="text-sm">No notes yet</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createNote}
                  className="mt-2"
                  icon={<Plus className="h-3 w-3" />}
                >
                  Create Note
                </Button>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      activeNoteId === note.id
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm truncate">
                      {note.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(note.lastModified).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note Editor */}
          <div className="flex-1 flex flex-col">
            {activeNote ? (
              <>
                {/* Note Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                    className="flex-1 text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100"
                    placeholder="Note title..."
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNote(activeNote.id)}
                    icon={<Trash2 className="h-3 w-3" />}
                    className="text-red-600 hover:text-red-700"
                    title="Delete note"
                  />
                </div>

                {/* Note Content */}
                <div className="flex-1 p-3">
                  <RichTextEditor
                    value={activeNote.content}
                    onChange={(content) => updateNote(activeNote.id, { content })}
                    placeholder="Start writing your note..."
                    height="250px"
                    autoSave={true}
                    autoSaveDelay={2000}
                    showSaveButton={false}
                    className="h-full"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <div className="text-sm">Select a note to edit</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapsed State Info */}
      {!isExpanded && filteredNotes.length > 0 && (
        <div className="px-3 pb-2 text-xs text-gray-500 dark:text-gray-400">
          {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
          {state.currentTopic && ` for ${state.currentTopic.title}`}
        </div>
      )}
    </div>
  );
};

export default NotesPanel;
