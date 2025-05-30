import React, { useState } from 'react';
import { Plus, Code, StickyNote } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { generateId } from '../../utils/helpers';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import SimpleRichTextEditor from '../UI/SimpleRichTextEditor';
import VisualizationBlock from './VisualizationBlock';
import CodeEditor from './CodeEditor';
import NoteBlock from './NoteBlock';

const VisualizationPanel = () => {
  const { state, dispatch } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('visualization'); // 'visualization' or 'note'
  const [newVizTitle, setNewVizTitle] = useState('');
  const [newVizCode, setNewVizCode] = useState(`<div style="text-align: center; padding: 20px;">
  <h2>Hello World!</h2>
  <p>This is your visualization. Edit the HTML/CSS/JavaScript to create interactive content.</p>
  <button onclick="alert('Hello from your visualization!')">Click me!</button>
</div>

<script>
  // Add your JavaScript here
  console.log('Visualization loaded!');
</script>`);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  const currentTopicVisualizations = state.visualizations.filter(
    viz => viz.topicId === state.currentTopic?.id
  );

  const currentTopicNotes = (state.visualizationNotes || []).filter(
    note => note.topicId === state.currentTopic?.id
  );

  const handleAddVisualization = () => {
    setModalType('visualization');
    setNewVizTitle('');
    setNewVizCode(`<div style="text-align: center; padding: 20px;">
  <h2>Hello World!</h2>
  <p>This is your visualization. Edit the HTML/CSS/JavaScript to create interactive content.</p>
  <button onclick="alert('Hello from your visualization!')">Click me!</button>
</div>

<script>
  // Add your JavaScript here
  console.log('Visualization loaded!');
</script>`);
    setShowAddModal(true);
  };

  const handleAddNote = () => {
    setModalType('note');
    setNewNoteTitle('');
    setNewNoteContent('');
    setShowAddModal(true);
  };

  const handleSaveVisualization = () => {
    if (!state.currentTopic) {
      alert('Please select a topic first');
      return;
    }

    const newVisualization = {
      id: generateId(),
      topicId: state.currentTopic.id,
      title: newVizTitle || 'New Visualization',
      code: newVizCode,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_VISUALIZATION', payload: newVisualization });
    setShowAddModal(false);
  };

  const handleSaveNote = () => {
    if (!state.currentTopic) {
      alert('Please select a topic first');
      return;
    }

    const newNote = {
      id: generateId(),
      topicId: state.currentTopic.id,
      title: newNoteTitle || 'New Note',
      content: newNoteContent,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_VISUALIZATION_NOTE', payload: newNote });
    setShowAddModal(false);
  };

  const handleSave = () => {
    if (modalType === 'visualization') {
      handleSaveVisualization();
    } else {
      handleSaveNote();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Interactive Visualizations
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddNote}
            icon={<StickyNote className="h-4 w-4" />}
          >
            Add Note
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddVisualization}
            icon={<Plus className="h-4 w-4" />}
          >
            Add Visualization
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!state.currentTopic ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              Select a topic to view and add visualizations and notes
            </div>
          </div>
        ) : currentTopicVisualizations.length === 0 && currentTopicNotes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              No content yet for "{state.currentTopic.title}"
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={handleAddNote}
                icon={<StickyNote className="h-4 w-4" />}
              >
                Create First Note
              </Button>
              <Button
                variant="outline"
                onClick={handleAddVisualization}
                icon={<Code className="h-4 w-4" />}
              >
                Create First Visualization
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Notes */}
            {currentTopicNotes.map((note, index) => (
              <NoteBlock
                key={note.id}
                note={note}
                index={index}
                total={currentTopicNotes.length}
              />
            ))}

            {/* Visualizations */}
            {currentTopicVisualizations.map((viz, index) => (
              <VisualizationBlock
                key={viz.id}
                visualization={viz}
                index={index}
                total={currentTopicVisualizations.length}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add New ${modalType === 'visualization' ? 'Visualization' : 'Note'}`}
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={modalType === 'visualization' ? newVizTitle : newNoteTitle}
              onChange={(e) => modalType === 'visualization' ? setNewVizTitle(e.target.value) : setNewNoteTitle(e.target.value)}
              className="input-field"
              placeholder={`Enter ${modalType} title...`}
            />
          </div>

          {modalType === 'visualization' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                HTML/CSS/JavaScript Code
              </label>
              <CodeEditor
                value={newVizCode}
                onChange={setNewVizCode}
                language="html"
                height="400px"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content
              </label>
              <SimpleRichTextEditor
                value={newNoteContent}
                onChange={setNewNoteContent}
                placeholder="Start writing your note here..."
                height="400px"
                showSaveButton={false}
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                💡 Use the toolbar for formatting, colors, lists, and image uploads
              </div>
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
              onClick={handleSave}
              disabled={modalType === 'visualization' ? !newVizTitle : !newNoteTitle}
            >
              Add {modalType === 'visualization' ? 'Visualization' : 'Note'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VisualizationPanel;
