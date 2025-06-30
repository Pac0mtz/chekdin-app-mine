import React, { createContext, useContext, useState } from 'react';

// Define the app's color palette based on the colors found in the codebase
const colors = {
  // Primary brand colors
  primary: '#02676C', // Main brand color used throughout the app
  primaryLight: '#60C0B1', // Lighter variant of primary
  primaryDark: '#125E62', // Darker variant of primary
  
  // Background colors
  background: '#FDFEFC', // Main app background
  surface: '#FFFFFF', // Card/surface background
  surfaceLight: '#E8F0F9', // Light surface background
  surfaceLighter: '#E0F2F1', // Very light surface
  
  // Text colors
  text: '#000000', // Primary text color
  textSecondary: '#707070', // Secondary text color
  textLight: '#999999', // Light text color
  textOnPrimary: '#FFFFFF', // Text on primary background
  
  // Border colors
  border: '#D7D7D7', // Standard border color
  borderLight: '#f0f0f0', // Light border color
  
  // Status colors
  success: '#60C0B1', // Success/positive color
  error: '#E74C3C', // Error/negative color
  warning: '#FFA726', // Warning color
  
  // Switch colors
  switchTrack: '#767577', // Switch track color
  switchThumb: '#f4f3f4', // Switch thumb color
  switchActive: '#02676C', // Active switch color
  
  // Shadow colors
  shadow: '#00000012', // Standard shadow
  shadowDark: '#000040', // Darker shadow
  
  // Transparent colors
  transparent: 'transparent',
};

// Define spacing and typography
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const typography = {
  h1: {
    fontSize: 24,
    fontWeight: '700',
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
};

// Define border radius
const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 28,
  round: 50,
};

// Create the theme object
const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  // Add any other theme properties here
};

// Create the theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [currentTheme] = useState(theme);

  return (
    <ThemeContext.Provider value={currentTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export the theme object for direct use if needed
export { theme }; 