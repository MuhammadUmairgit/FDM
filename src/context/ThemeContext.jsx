import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem('themeMode');
    return savedTheme || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    document.body.className = themeMode;
  }, [themeMode]);

  const toggleTheme = (mode) => {
    const newMode = mode || (themeMode === 'light' ? 'dark' : 'light');
    setThemeMode(newMode);
    // Refresh after theme change to ensure all components update
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};