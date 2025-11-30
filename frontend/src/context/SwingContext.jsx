import { createContext, useContext, useState, useEffect } from 'react';
import { getSwingHistory } from '../services/api';

const SwingContext = createContext();

export const useSwing = () => {
  const context = useContext(SwingContext);
  if (!context) {
    throw new Error('useSwing must be used within a SwingProvider');
  }
  return context;
};

export const SwingProvider = ({ children }) => {
  const [swingHistory, setSwingHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSwings, setSelectedSwings] = useState([]);

  // Load swing history on mount
  useEffect(() => {
    loadSwingHistory();
  }, []);

  const loadSwingHistory = async () => {
    try {
      setIsLoading(true);
      const data = await getSwingHistory();
      setSwingHistory(data);
    } catch (error) {
      console.error('Failed to load swing history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAnalysisToHistory = (analysis) => {
    setSwingHistory(prev => [analysis, ...prev]);
  };

  const removeFromHistory = (id) => {
    setSwingHistory(prev => prev.filter(swing => swing.id !== id));
  };

  const toggleSwingSelection = (swing) => {
    setSelectedSwings(prev => {
      const isSelected = prev.some(s => s.id === swing.id);
      if (isSelected) {
        return prev.filter(s => s.id !== swing.id);
      } else if (prev.length < 2) {
        return [...prev, swing];
      }
      return prev;
    });
  };

  const clearSelection = () => {
    setSelectedSwings([]);
  };

  const value = {
    swingHistory,
    currentAnalysis,
    isLoading,
    selectedSwings,
    setCurrentAnalysis,
    loadSwingHistory,
    addAnalysisToHistory,
    removeFromHistory,
    toggleSwingSelection,
    clearSelection,
  };

  return (
    <SwingContext.Provider value={value}>
      {children}
    </SwingContext.Provider>
  );
};
