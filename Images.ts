/**
 * Image Assets Constants
 * Centralized location for all image paths
 * 
 * File Structure:
 * assets/
 * ├── images/          (Screenshots, photos, illustrations)
 * ├── icons/           (App icons, UI icons)
 * └── fonts/           (Custom fonts)
 */

export const IMAGES = {
  // App Icons
  LOGO: require('./img/CLogo.png'),
  
  // Placeholder for future images
  // SPLASH_BACKGROUND: require('../../assets/images/splash-bg.png'),
  // ONBOARDING_ILLUSTRATION: require('../../assets/images/onboarding.png'),
} as const;

export const ICONS = {
  YTicon: require('./img/YTsvg.svg'),
  // UI Icons (when you add them)
  // BACK_ARROW: require('../../assets/icons/back-arrow.png'),
  // SETTINGS: require('../../assets/icons/settings.png'),
  // CAMERA: require('../../assets/icons/camera.png'),
} as const;