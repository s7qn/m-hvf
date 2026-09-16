import { useState, useEffect } from 'react';

export type DetectedDeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceDetectorState {
  detectedType: DetectedDeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

export function useDeviceDetector(): DeviceDetectorState {
  const getSnapshot = (): DeviceDetectorState => {
    if (typeof window === 'undefined') {
      return {
        detectedType: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1200,
        screenHeight: 800,
        orientation: 'landscape',
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 1024;
    const isDesktop = width >= 1024;
    const detectedType: DetectedDeviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
    const orientation: 'portrait' | 'landscape' = width < height ? 'portrait' : 'landscape';

    return {
      detectedType,
      isMobile,
      isTablet,
      isDesktop,
      screenWidth: width,
      screenHeight: height,
      orientation,
    };
  };

  const [state, setState] = useState<DeviceDetectorState>(getSnapshot);

  useEffect(() => {
    const handleResize = () => {
      setState(getSnapshot());
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return state;
}
