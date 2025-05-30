import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useApp } from '../../contexts/AppContext';
import Header from './Header';
import TopicTree from '../TopicHierarchy/TopicTree';
import StudyPanel from '../StudyMaterials/StudyPanel';
import VisualizationPanel from '../Visualizations/VisualizationPanel';

const MainLayout = () => {
  const { state } = useApp();

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Topic Hierarchy Sidebar */}
        <div className={`${
          state.sidebarCollapsed ? 'w-0' : 'w-64'
        } transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden`}>
          <TopicTree />
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <PanelGroup direction="horizontal">
            {/* Left Panel - Study Materials */}
            {state.leftPanelVisible && (
              <>
                <Panel defaultSize={50} minSize={20}>
                  <div className="h-full bg-white dark:bg-gray-800">
                    <StudyPanel />
                  </div>
                </Panel>
                <PanelResizeHandle className="w-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" />
              </>
            )}

            {/* Right Panel - Visualizations */}
            {state.rightPanelVisible && (
              <Panel defaultSize={state.leftPanelVisible ? 50 : 100} minSize={20}>
                <div className="h-full bg-white dark:bg-gray-800">
                  <VisualizationPanel />
                </div>
              </Panel>
            )}

            {/* Empty state when both panels are hidden */}
            {!state.leftPanelVisible && !state.rightPanelVisible && (
              <Panel defaultSize={100}>
                <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800">
                  <div className="text-center">
                    <div className="text-gray-500 dark:text-gray-400 mb-4">
                      Both panels are hidden. Use the toggle buttons in the header to show them.
                    </div>
                  </div>
                </div>
              </Panel>
            )}
          </PanelGroup>
        </div>


      </div>
    </div>
  );
};

export default MainLayout;
