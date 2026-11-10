// Device detection utility
export const isMobileOrTablet = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Check for mobile devices
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  const isMobile = mobileRegex.test(userAgent.toLowerCase());
  
  // Check for tablet
  const tabletRegex = /tablet|ipad|playbook|silk|(android(?!.*mobi))/i;
  const isTablet = tabletRegex.test(userAgent.toLowerCase());
  
  // Additional check for touch devices with large screens
  const isTouchDevice = () => {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
  };
  
  // Check screen width (1200px is minimum laptop width)
  const isSmallScreen = window.innerWidth < 1200;
  
  return isMobile || isTablet || (isTouchDevice() && isSmallScreen);
};

export const isLaptopOrDesktop = () => {
  return !isMobileOrTablet();
};

export const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/ipad|android(?!.*mobi)/.test(userAgent)) {
    return 'tablet';
  } else if (/iphone|android|webos|blackberry/.test(userAgent)) {
    return 'mobile';
  } else {
    return 'desktop';
  }
};
