import {Dimensions, PixelRatio, Platform} from 'react-native';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

// Base dimensions (iPhone 11 Pro)
const baseWidth = 375;
const baseHeight = 812;

// Screen size breakpoints
const screenSizes = {
  small: 480, // Small phones
  medium: 720, // Medium phones
  large: 900, // Large phones
  xlarge: 1200, // Tablets
};

// Responsive height calculation
export const RPH = percentage => {
  return (percentage / 100) * screenHeight;
};

// Responsive width calculation
export const RPW = percentage => {
  return (percentage / 100) * screenWidth;
};

// Responsive font size
export const RF = size => {
  const scale = screenWidth / baseWidth;
  const newSize = size * scale;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

// Responsive padding/margin
export const RP = size => {
  const scale = screenWidth / baseWidth;
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

// Get screen size category
export const getScreenSize = () => {
  const width = screenWidth;
  if (width < screenSizes.small) {
    return 'small';
  }
  if (width < screenSizes.medium) {
    return 'medium';
  }
  if (width < screenSizes.large) {
    return 'large';
  }
  return 'xlarge';
};

// Check if device is tablet
export const isTablet = () => {
  return screenWidth >= screenSizes.large;
};

// Check if device is small phone
export const isSmallPhone = () => {
  return screenWidth < screenSizes.small;
};

// Responsive spacing based on screen size
export const getResponsiveSpacing = (small, medium, large, xlarge) => {
  const screenSize = getScreenSize();
  switch (screenSize) {
    case 'small':
      return small;
    case 'medium':
      return medium;
    case 'large':
      return large;
    case 'xlarge':
      return xlarge;
    default:
      return medium;
  }
};

// Responsive font size based on screen size
export const getResponsiveFontSize = (small, medium, large, xlarge) => {
  const screenSize = getScreenSize();
  switch (screenSize) {
    case 'small':
      return RF(small);
    case 'medium':
      return RF(medium);
    case 'large':
      return RF(large);
    case 'xlarge':
      return RF(xlarge);
    default:
      return RF(medium);
  }
};

// Responsive image size
export const getResponsiveImageSize = (small, medium, large, xlarge) => {
  const screenSize = getScreenSize();
  switch (screenSize) {
    case 'small':
      return RP(small);
    case 'medium':
      return RP(medium);
    case 'large':
      return RP(large);
    case 'xlarge':
      return RP(xlarge);
    default:
      return RP(medium);
  }
};

// Safe area padding
export const getSafeAreaPadding = () => {
  const screenSize = getScreenSize();
  switch (screenSize) {
    case 'small':
      return 10;
    case 'medium':
      return 15;
    case 'large':
      return 20;
    case 'xlarge':
      return 25;
    default:
      return 15;
  }
};

// Responsive button height
export const getResponsiveButtonHeight = () => {
  const screenSize = getScreenSize();
  switch (screenSize) {
    case 'small':
      return 40;
    case 'medium':
      return 45;
    case 'large':
      return 50;
    case 'xlarge':
      return 55;
    default:
      return 45;
  }
};

// Responsive input height
export const getResponsiveInputHeight = () => {
  const screenSize = getScreenSize();
  switch (screenSize) {
    case 'small':
      return 40;
    case 'medium':
      return 45;
    case 'large':
      return 50;
    case 'xlarge':
      return 55;
    default:
      return 45;
  }
};

// Responsive border radius
export const getResponsiveBorderRadius = (small, medium, large, xlarge) => {
  const screenSize = getScreenSize();
  switch (screenSize) {
    case 'small':
      return RP(small);
    case 'medium':
      return RP(medium);
    case 'large':
      return RP(large);
    case 'xlarge':
      return RP(xlarge);
    default:
      return RP(medium);
  }
};

// Responsive shadow
export const getResponsiveShadow = () => {
  const screenSize = getScreenSize();
  switch (screenSize) {
    case 'small':
      return {
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      };
    case 'medium':
      return {
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      };
    case 'large':
      return {
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
      };
    case 'xlarge':
      return {
        shadowOffset: {width: 0, height: 5},
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
      };
    default:
      return {
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      };
  }
};

// Export screen dimensions for direct access
export const screenDimensions = {
  width: screenWidth,
  height: screenHeight,
  isTablet: isTablet(),
  isSmallPhone: isSmallPhone(),
  screenSize: getScreenSize(),
};
