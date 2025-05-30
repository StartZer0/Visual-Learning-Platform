import React, { useState } from 'react';
import { Plus, Code } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { generateId } from '../../utils/helpers';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import VisualizationBlock from './VisualizationBlock';
import CodeEditor from './CodeEditor';

const VisualizationPanel = () => {
  const { state, dispatch } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
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

  const currentTopicVisualizations = state.visualizations.filter(
    viz => viz.topicId === state.currentTopic?.id
  );

  const handleAddVisualization = () => {
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Interactive Visualizations
        </h2>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddVisualization}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Visualization
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {!state.currentTopic ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              Select a topic to view and add visualizations
            </div>
          </div>
        ) : currentTopicVisualizations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              No visualizations yet for "{state.currentTopic.title}"
            </div>
            <Button
              variant="outline"
              onClick={handleAddVisualization}
              icon={<Code className="h-4 w-4" />}
            >
              Create First Visualization
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
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
        title="Add New Visualization"
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={newVizTitle}
              onChange={(e) => setNewVizTitle(e.target.value)}
              className="input-field"
              placeholder="Enter visualization title..."
            />
          </div>

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

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveVisualization}
              disabled={!newVizTitle}
            >
              Add Visualization
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VisualizationPanel;
