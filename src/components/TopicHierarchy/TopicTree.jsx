import React from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { generateId } from '../../utils/helpers';
import Button from '../UI/Button';
import TopicNode from './TopicNode';

const TopicTree = () => {
  const { state, dispatch } = useApp();

  const handleAddMainTopic = () => {
    const newTopic = {
      id: generateId(),
      title: 'New Topic',
      children: [],
      expanded: false,
      parentId: null,
    };

    dispatch({ type: 'ADD_TOPIC', payload: newTopic });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Topics
        </h2>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddMainTopic}
          icon={<Plus className="h-4 w-4" />}
        >
          Add Topic
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {state.topics.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              No topics yet. Create your first topic to get started.
            </div>
            <Button
              variant="outline"
              onClick={handleAddMainTopic}
              icon={<Plus className="h-4 w-4" />}
            >
              Create First Topic
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {state.topics.map((topic) => (
              <div key={topic.id} className="group">
                <TopicNode topic={topic} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicTree;
