import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

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
  visualizationNotes: [],
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
    case 'SET_STUDY_MATERIALS':
      return { ...state, studyMaterials: action.payload };
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
    case 'SET_VISUALIZATION_NOTES':
      return { ...state, visualizationNotes: action.payload };
    case 'ADD_VISUALIZATION_NOTE':
      return { ...state, visualizationNotes: [...state.visualizationNotes, action.payload] };
    case 'UPDATE_VISUALIZATION_NOTE':
      return {
        ...state,
        visualizationNotes: state.visualizationNotes.map(note =>
          note.id === action.payload.id ? action.payload : note
        ),
      };
    case 'DELETE_VISUALIZATION_NOTE':
      return {
        ...state,
        visualizationNotes: state.visualizationNotes.filter(note => note.id !== action.payload),
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

  // Load state from backend or localStorage on mount
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        // Try to load from backend first
        const backendAvailable = await apiService.checkHealth();
        if (backendAvailable) {
          try {
            const backendState = await apiService.loadState();
            console.log('Loaded state from backend');

            // Restore PDF URLs for persistent files
            if (backendState.studyMaterials) {
              const restoredMaterials = backendState.studyMaterials.map(material => {
                if (material.type === 'pdf' && material.isPersistent && material.filename) {
                  // Restore the backend URL
                  return {
                    ...material,
                    url: apiService.getFileUrl(material.filename),
                    needsReupload: false
                  };
                }
                return material;
              });

              backendState.studyMaterials = restoredMaterials;
            }

            // Since we're using full URLs, no image restoration needed
            console.log('✅ Loaded state from backend with',
              backendState.studyMaterials?.length || 0, 'study materials and',
              backendState.visualizationNotes?.length || 0, 'visualization notes');

            dispatch({ type: 'LOAD_STATE', payload: backendState });
            return;
          } catch (backendError) {
            console.warn('Failed to load from backend, trying localStorage:', backendError);
          }
        }

        // Fallback to localStorage
        const savedState = localStorage.getItem('learningPlatformState');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          console.log('Loaded state from localStorage');
          dispatch({ type: 'LOAD_STATE', payload: parsedState });
        }
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    };

    loadInitialState();
  }, []);

  // Simplified: No complex file restoration for now

  // Save state to backend and localStorage whenever it changes (but debounce it)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      // Create a clean state object for saving
      const stateToSave = {
        ...state,
        studyMaterials: state.studyMaterials.map(material => {
          if (material.type === 'pdf') {
            // For PDFs, save metadata but not blob URLs
            const { url, file, ...cleanMaterial } = material;
            return cleanMaterial;
          }
          return material;
        })
      };

      console.log('🔍 AppContext: Saving state with:', {
        studyMaterials: stateToSave.studyMaterials?.length || 0,
        visualizationNotes: stateToSave.visualizationNotes?.length || 0,
        textMaterials: stateToSave.studyMaterials?.filter(m => m.type === 'text').length || 0
      });

      // Log text materials with content
      const textMaterials = stateToSave.studyMaterials?.filter(m => m.type === 'text') || [];
      textMaterials.forEach((material, index) => {
        console.log(`📄 AppContext: Text material ${index + 1}:`, {
          id: material.id,
          title: material.title,
          contentLength: material.content?.length || 0,
          hasImages: material.content?.includes('<img') || false,
          content: material.content
        });
      });

      // Try to save to backend first
      try {
        const backendAvailable = await apiService.checkHealth();
        if (backendAvailable) {
          console.log('💾 AppContext: Saving to backend...');
          await apiService.saveState(stateToSave);
          console.log('✅ AppContext: State saved to backend successfully');
        } else {
          console.warn('⚠️ AppContext: Backend not available');
        }
      } catch (backendError) {
        console.error('❌ AppContext: Failed to save to backend:', backendError);
      }

      // Always save to localStorage as backup
      try {
        localStorage.setItem('learningPlatformState', JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Failed to save state to localStorage:', error);
      }
    }, 100); // Debounce saves by 100ms for faster persistence

    return () => clearTimeout(timeoutId);
  }, [state]);

  // Simplified: No cleanup needed for now

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
