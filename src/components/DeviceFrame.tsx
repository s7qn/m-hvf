import React from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Sparkles, 
  RotateCcw,
  Wifi,
  BatteryMedium
} from 'lucide-react';
import { DeviceMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { DetectedDeviceType } from '../hooks/useDeviceDetector';

interface DeviceFrameProps {
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  detectedType: DetectedDeviceType;
  language: Language;
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  deviceMode,
  onDeviceModeChange,
  detectedType,
  language,
  children,
}) => {
  const t = TRANSLATIONS[language];

  // If in auto mode or if the user is already on a mobile screen, render full native responsive layout
  if (deviceMode === 'auto' || detectedType === 'mobile') {
    return <>{children}</>;
  }

  // Get active device info for desktop simulation preview
  const getDeviceInfo = () => {
    switch (deviceMode) {
      case 'mobile':
        return {
          name: language === 'ar' ? 'واجهة التلفون (الهاتف المحمول)' : 'Smartphone / Mobile View',
          specs: '390px Mobile View',
          icon: Smartphone,
          maxWidthClass: 'max-w-[420px]',
          frameStyle: 'rounded-3xl border border-slate-300 dark:border-slate-700 shadow-2xl overflow-hidden',
          type: 'mobile',
        };
      case 'tablet':
        return {
          name: language === 'ar' ? 'واجهة الآيباد (الجهاز اللوحي)' : 'iPad / Tablet View',
          specs: '820px Tablet View',
          icon: Tablet,
          maxWidthClass: 'max-w-[820px]',
          frameStyle: 'rounded-3xl border border-slate-300 dark:border-slate-700 shadow-2xl overflow-hidden',
          type: 'tablet',
        };
      case 'desktop':
        return {
          name: language === 'ar' ? 'واجهة الحاسبة (الكمبيوتر والمكتبي)' : 'Desktop / PC View',
          specs: 'Desktop View',
          icon: Monitor,
          maxWidthClass: 'max-w-7xl',
          frameStyle: 'rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl',
          type: 'desktop',
        };
      default:
        return {
          name: 'Device View',
          specs: '',
          icon: Monitor,
          maxWidthClass: 'max-w-full',
          frameStyle: '',
          type: 'auto',
        };
    }
  };

  const info = getDeviceInfo();
  const Icon = info.icon;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070d1e] py-3 sm:py-5 px-2 flex flex-col items-center transition-colors">
      {/* Simulation Control Bar at Top (Only for desktop testers) */}
      <div 
        id="device-simulation-bar"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 mb-3 shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 dark:text-white text-xs">
                {info.name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900/60">
                {info.specs}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Switch Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onDeviceModeChange('mobile')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              deviceMode === 'mobile'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t.devicePhone}</span>
          </button>

          <button
            type="button"
            onClick={() => onDeviceModeChange('tablet')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              deviceMode === 'tablet'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>{t.deviceTablet}</span>
          </button>

          <button
            type="button"
            onClick={() => onDeviceModeChange('desktop')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              deviceMode === 'desktop'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{t.deviceDesktop}</span>
          </button>

          <button
            type="button"
            onClick={() => onDeviceModeChange('auto')}
            className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            title={t.deviceResetAuto}
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.deviceResetAuto}</span>
          </button>
        </div>
      </div>

      {/* Device Body Container */}
      <div 
        id="device-frame-viewport"
        className={`w-full ${info.maxWidthClass} bg-white dark:bg-[#0b1329] ${info.frameStyle} transition-all duration-300 relative flex flex-col`}
      >
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};
