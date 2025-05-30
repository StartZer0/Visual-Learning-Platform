import React from 'react';
import { BookOpen, PanelLeftClose, PanelRightClose, Save, Upload, Menu, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Button from '../UI/Button';
import ThemeToggle from '../UI/ThemeToggle';

const Header = () => {
  const { state, dispatch } = useApp();

  const handleSave = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'learning-module.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedState = JSON.parse(e.target.result);
          dispatch({ type: 'LOAD_STATE', payload: loadedState });
        } catch (error) {
          console.error('Failed to load file:', error);
          alert('Failed to load file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Visual Learning Platform
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            icon={state.sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            title="Toggle topics sidebar"
          />

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'TOGGLE_LEFT_PANEL' })}
            icon={<PanelLeftClose className="h-4 w-4" />}
            title="Toggle study materials panel"
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'TOGGLE_RIGHT_PANEL' })}
            icon={<PanelRightClose className="h-4 w-4" />}
            title="Toggle visualizations panel"
          />

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            icon={<Save className="h-4 w-4" />}
          >
            Save
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleLoad}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={<Upload className="h-4 w-4" />}
              as="span"
            >
              Load
            </Button>
          </label>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
