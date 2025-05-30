import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const initialState = {
  topics: [],
  currentTopic: null,
  studyMaterials: [],
  visualizations: [],
  contentLinks: [],
  leftPanelVisible: true,
  rightPanelVisible: true,
  leftPanelWidth: 50,
  sidebarCollapsed: false, // ALWAYS start with sidebar visible
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TOPICS':
      return { ...state, topics: action.payload };
    case 'ADD_TOPIC':
      return { ...state, topics: [...state.topics, action.payload] };
    case 'UPDATE_TOPIC':
      // Recursive function to update topics and sub-topics
      const updateTopicRecursively = (topics, updatedTopic) => {
        return topics.map(topic => {
          if (topic.id === updatedTopic.id) {
            // Production debug: Log successful update
            if (process.env.NODE_ENV !== 'production') {
              console.log('Updating topic:', topic.title, '->', updatedTopic.title);
            }
            return updatedTopic;
          }
          if (topic.children && topic.children.length > 0) {
            return {
              ...topic,
              children: updateTopicRecursively(topic.children, updatedTopic)
            };
          }
          return topic;
        });
      };

      const updatedTopics = updateTopicRecursively(state.topics, action.payload);

      return {
        ...state,
        topics: updatedTopics,
      };
    case 'DELETE_TOPIC':
      // Recursive function to delete topics and sub-topics
      const deleteTopicRecursively = (topics, topicIdToDelete) => {
        return topics
          .filter(topic => topic.id !== topicIdToDelete)
          .map(topic => {
            if (topic.children && topic.children.length > 0) {
              return {
                ...topic,
                children: deleteTopicRecursively(topic.children, topicIdToDelete)
              };
            }
            return topic;
          });
      };

      const newTopics = deleteTopicRecursively(state.topics, action.payload);

      // If the deleted topic was the current topic, clear it
      const newCurrentTopic = state.currentTopic?.id === action.payload ? null : state.currentTopic;

      return {
        ...state,
        topics: newTopics,
        currentTopic: newCurrentTopic,
      };
    case 'SET_CURRENT_TOPIC':
      return { ...state, currentTopic: action.payload };
    case 'ADD_STUDY_MATERIAL':
      return { ...state, studyMaterials: [...state.studyMaterials, action.payload] };
    case 'UPDATE_STUDY_MATERIAL':
      return {
        ...state,
        studyMaterials: state.studyMaterials.map(material =>
          material.id === action.payload.id ? action.payload : material
        ),
      };
    case 'DELETE_STUDY_MATERIAL':
      return {
        ...state,
        studyMaterials: state.studyMaterials.filter(material => material.id !== action.payload),
      };
    case 'REORDER_STUDY_MATERIALS':
      return { ...state, studyMaterials: action.payload };
    case 'ADD_VISUALIZATION':
      return { ...state, visualizations: [...state.visualizations, action.payload] };
    case 'UPDATE_VISUALIZATION':
      return {
        ...state,
        visualizations: state.visualizations.map(viz =>
          viz.id === action.payload.id ? action.payload : viz
        ),
      };
    case 'DELETE_VISUALIZATION':
      return {
        ...state,
        visualizations: state.visualizations.filter(viz => viz.id !== action.payload),
      };
    case 'REORDER_VISUALIZATIONS':
      return { ...state, visualizations: action.payload };
    case 'ADD_CONTENT_LINK':
      return { ...state, contentLinks: [...state.contentLinks, action.payload] };
    case 'DELETE_CONTENT_LINK':
      return {
        ...state,
        contentLinks: state.contentLinks.filter(link => link.id !== action.payload),
      };
    case 'TOGGLE_LEFT_PANEL':
      return { ...state, leftPanelVisible: !state.leftPanelVisible };
    case 'TOGGLE_RIGHT_PANEL':
      return { ...state, rightPanelVisible: !state.rightPanelVisible };
    case 'SET_LEFT_PANEL_WIDTH':
      return { ...state, leftPanelWidth: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SHOW_SIDEBAR':
      return { ...state, sidebarCollapsed: false };
    case 'HIDE_SIDEBAR':
      return { ...state, sidebarCollapsed: true };
    case 'LOAD_STATE':
      // Load state with proper fallbacks - don't force sidebar state in production
      const loadedState = {
        ...state,
        ...action.payload,
        leftPanelVisible: action.payload.leftPanelVisible !== undefined ? action.payload.leftPanelVisible : state.leftPanelVisible,
        rightPanelVisible: action.payload.rightPanelVisible !== undefined ? action.payload.rightPanelVisible : state.rightPanelVisible,
      };

      // Only force sidebar visible if it's undefined in loaded state (first time load)
      if (action.payload.sidebarCollapsed === undefined) {
        loadedState.sidebarCollapsed = false;
      } else {
        loadedState.sidebarCollapsed = action.payload.sidebarCollapsed;
      }

      return loadedState;
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('learningPlatformState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: parsedState });
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes (but debounce it)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Create a clean state object for saving (exclude blob URLs but keep PDF info)
      const stateToSave = {
        ...state,
        studyMaterials: state.studyMaterials.map(material => {
          if (material.type === 'pdf' && material.url && material.url.startsWith('blob:')) {
            // Don't save blob URLs as they're temporary, but keep the PDF info
            const { url, file, ...cleanMaterial } = material;
            return { ...cleanMaterial, needsReupload: true };
          }
          return material;
        })
      };

      try {
        localStorage.setItem('learningPlatformState', JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Failed to save state to localStorage:', error);
      }
    }, 100); // Debounce saves by 100ms

    return () => clearTimeout(timeoutId);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
