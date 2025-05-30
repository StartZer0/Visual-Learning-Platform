import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { generateId } from '../../utils/helpers';
import Button from '../UI/Button';

const ProductionTestPanel = () => {
  const { state, dispatch } = useApp();
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result, details = '') => {
    setTestResults(prev => [...prev, {
      id: generateId(),
      test,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testSidebarToggle = () => {
    const initialState = state.sidebarCollapsed;
    addTestResult('Sidebar Toggle', 'TESTING', `Initial state: ${initialState}`);

    // Toggle sidebar
    dispatch({ type: 'TOGGLE_SIDEBAR' });

    // Check after a short delay to allow state update
    setTimeout(() => {
      const newState = !initialState; // Expected new state
      const success = state.sidebarCollapsed === newState;
      addTestResult('Sidebar Toggle', success ? 'PASS' : 'FAIL',
        `Expected: ${newState}, Actual: ${state.sidebarCollapsed}`);
    }, 100);
  };

  const testSubTopicCRUD = () => {
    // Create a test main topic first
    const mainTopic = {
      id: generateId(),
      title: 'Test Main Topic',
      children: [],
      expanded: false,
      parentId: null,
    };

    addTestResult('Sub-topic CRUD', 'TESTING', 'Creating main topic...');
    dispatch({ type: 'ADD_TOPIC', payload: mainTopic });

    setTimeout(() => {
      // Add a sub-topic
      const subTopic = {
        id: generateId(),
        title: 'Test Sub-topic',
        children: [],
        expanded: false,
        parentId: mainTopic.id,
      };

      const updatedMainTopic = {
        ...mainTopic,
        children: [subTopic],
        expanded: true,
      };

      addTestResult('Sub-topic CRUD', 'TESTING', 'Adding sub-topic...');
      dispatch({ type: 'UPDATE_TOPIC', payload: updatedMainTopic });

      setTimeout(() => {
        // Test edit sub-topic - simulate the actual edit process
        const editedSubTopic = {
          ...subTopic,
          title: 'Edited Sub-topic Production Test'
        };

        addTestResult('Sub-topic CRUD', 'TESTING', 'Testing sub-topic edit...');
        dispatch({ type: 'UPDATE_TOPIC', payload: editedSubTopic });

        setTimeout(() => {
          // Verify the edit worked
          const currentTopics = state.topics;
          const mainTopicInState = currentTopics.find(t => t.id === mainTopic.id);
          const subTopicInState = mainTopicInState?.children?.find(c => c.id === subTopic.id);

          if (subTopicInState?.title === 'Edited Sub-topic Production Test') {
            addTestResult('Sub-topic Edit', 'PASS', 'Sub-topic edit successful');
          } else {
            addTestResult('Sub-topic Edit', 'FAIL', `Expected: "Edited Sub-topic Production Test", Got: "${subTopicInState?.title}"`);
          }

          // Test delete sub-topic
          addTestResult('Sub-topic Delete', 'TESTING', 'Testing sub-topic deletion...');
          dispatch({ type: 'DELETE_TOPIC', payload: subTopic.id });

          setTimeout(() => {
            // Verify deletion worked
            const updatedTopics = state.topics;
            const mainTopicAfterDelete = updatedTopics.find(t => t.id === mainTopic.id);
            const subTopicExists = mainTopicAfterDelete?.children?.find(c => c.id === subTopic.id);

            if (!subTopicExists) {
              addTestResult('Sub-topic Delete', 'PASS', 'Sub-topic deletion successful');
            } else {
              addTestResult('Sub-topic Delete', 'FAIL', 'Sub-topic still exists after deletion');
            }

            // Clean up - delete main topic
            setTimeout(() => {
              dispatch({ type: 'DELETE_TOPIC', payload: mainTopic.id });
              addTestResult('Sub-topic CRUD', 'COMPLETED', 'All tests finished, cleanup done');
            }, 100);
          }, 200);
        }, 200);
      }, 200);
    }, 200);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('learningPlatformState');
    addTestResult('LocalStorage', 'CLEARED', 'State cleared, reload to test fresh state');
  };

  const testProductionEnvironment = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isNetlify = window.location.hostname.includes('netlify');
    const userAgent = navigator.userAgent;

    addTestResult('Environment', 'INFO', `NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    addTestResult('Environment', 'INFO', `Is Netlify: ${isNetlify}`);
    addTestResult('Environment', 'INFO', `Hostname: ${window.location.hostname}`);
    addTestResult('Environment', 'INFO', `User Agent: ${userAgent.substring(0, 50)}...`);

    // Test if React is in production mode
    const reactVersion = React.version;
    addTestResult('React', 'INFO', `React version: ${reactVersion}`);

    // Test if event handlers are properly bound
    const testHandler = () => 'test';
    const boundHandler = testHandler.bind(null);
    addTestResult('Event Binding', boundHandler() === 'test' ? 'PASS' : 'FAIL', 'Event handler binding test');
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 max-w-md z-50">
      <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
        Production Tests
      </h3>

      <div className="space-y-2 mb-4">
        <Button
          variant="primary"
          size="sm"
          onClick={testSidebarToggle}
          className="w-full"
        >
          Test Sidebar Toggle
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={testSubTopicCRUD}
          className="w-full"
        >
          Test Sub-topic CRUD
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={testProductionEnvironment}
          className="w-full"
        >
          Test Environment
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={clearLocalStorage}
          className="w-full"
        >
          Clear LocalStorage
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearResults}
          className="w-full"
        >
          Clear Results
        </Button>
      </div>

      <div className="max-h-48 overflow-y-auto">
        <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Test Results:
        </h4>
        {testResults.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No tests run yet</p>
        ) : (
          <div className="space-y-1">
            {testResults.map(result => (
              <div
                key={result.id}
                className={`text-xs p-2 rounded ${
                  result.result === 'PASS'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : result.result === 'FAIL'
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                }`}
              >
                <div className="font-medium">{result.test}: {result.result}</div>
                {result.details && (
                  <div className="text-xs opacity-75">{result.details}</div>
                )}
                <div className="text-xs opacity-50">{result.timestamp}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div>Sidebar: {state.sidebarCollapsed ? 'Hidden' : 'Visible'}</div>
          <div>Topics: {state.topics.length}</div>
          <div>Environment: {process.env.NODE_ENV || 'development'}</div>
        </div>
      </div>
    </div>
  );
};

export default ProductionTestPanel;
