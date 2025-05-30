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
  sidebarCollapsed: false,
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TOPICS':
      return { ...state, topics: action.payload };
    case 'ADD_TOPIC':
      return { ...state, topics: [...state.topics, action.payload] };
    case 'UPDATE_TOPIC':
      return {
        ...state,
        topics: state.topics.map(topic =>
          topic.id === action.payload.id ? action.payload : topic
        ),
      };
    case 'DELETE_TOPIC':
      return {
        ...state,
        topics: state.topics.filter(topic => topic.id !== action.payload),
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
    case 'LOAD_STATE':
      // Ensure critical UI state is preserved
      return {
        ...state,
        ...action.payload,
        // Preserve sidebar state if not explicitly set in loaded data
        sidebarCollapsed: action.payload.sidebarCollapsed !== undefined ? action.payload.sidebarCollapsed : state.sidebarCollapsed,
        leftPanelVisible: action.payload.leftPanelVisible !== undefined ? action.payload.leftPanelVisible : state.leftPanelVisible,
        rightPanelVisible: action.payload.rightPanelVisible !== undefined ? action.payload.rightPanelVisible : state.rightPanelVisible,
      };
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

  // Save state to localStorage whenever it changes
  useEffect(() => {
    // Create a clean state object for saving (exclude file URLs and temporary data)
    const stateToSave = {
      ...state,
      studyMaterials: state.studyMaterials.map(material => {
        if (material.type === 'pdf' && material.url && material.url.startsWith('blob:')) {
          // Don't save blob URLs as they're temporary
          const { url, file, ...cleanMaterial } = material;
          return cleanMaterial;
        }
        return material;
      })
    };

    localStorage.setItem('learningPlatformState', JSON.stringify(stateToSave));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
