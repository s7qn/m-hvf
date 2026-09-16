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

  // If in auto mode, render directly with full responsive width
  if (deviceMode === 'auto') {
    return <>{children}</>;
  }

  // Get active device info
  const getDeviceInfo = () => {
    switch (deviceMode) {
      case 'mobile':
        return {
          name: language === 'ar' ? 'واجهة التلفون (الهاتف الذكي)' : 'Smartphone / Mobile View',
          specs: '390px × 844px',
          icon: Smartphone,
          maxWidthClass: 'max-w-[430px]',
          frameStyle: 'rounded-[38px] border-[10px] border-slate-850 dark:border-slate-800 shadow-2xl ring-1 ring-black/10',
          hasNotch: true,
          type: 'mobile',
        };
      case 'tablet':
        return {
          name: language === 'ar' ? 'واجهة الآيباد (الجهاز اللوحي)' : 'iPad / Tablet View',
          specs: '820px × 1180px',
          icon: Tablet,
          maxWidthClass: 'max-w-[840px]',
          frameStyle: 'rounded-[28px] border-[10px] border-slate-800 dark:border-slate-700 shadow-2xl ring-1 ring-black/10',
          hasNotch: false,
          hasCamera: true,
          type: 'tablet',
        };
      case 'desktop':
        return {
          name: language === 'ar' ? 'واجهة الحاسبة (الكمبيوتر والمكتبي)' : 'Desktop / PC View',
          specs: '1280px × Full Screen',
          icon: Monitor,
          maxWidthClass: 'max-w-7xl',
          frameStyle: 'rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl',
          hasNotch: false,
          type: 'desktop',
        };
      default:
        return {
          name: 'Device View',
          specs: '',
          icon: Monitor,
          maxWidthClass: 'max-w-full',
          frameStyle: '',
          hasNotch: false,
          type: 'auto',
        };
    }
  };

  const info = getDeviceInfo();
  const Icon = info.icon;

  return (
    <div className="min-h-screen bg-slate-200/80 dark:bg-[#060b18] py-4 sm:py-6 px-2 sm:px-4 flex flex-col items-center transition-colors">
      {/* Simulation Control Bar at Top */}
      <div 
        id="device-simulation-bar"
        className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-2 sm:p-2.5 mb-4 shadow-sm flex items-center justify-between flex-wrap gap-2 text-xs"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 dark:text-white">
                {info.name}
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                {info.specs}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {language === 'ar'
                ? `جهازك الحقيقي المُكتشف: ${detectedType === 'mobile' ? 'تلفون' : detectedType === 'tablet' ? 'جهاز لوحي' : 'حاسبة'}`
                : `Actual detected screen: ${detectedType}`}
            </p>
          </div>
        </div>

        {/* Quick Switch Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onDeviceModeChange('mobile')}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
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
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
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
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
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
            className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
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
        className={`w-full ${info.maxWidthClass} bg-white dark:bg-[#0b1329] ${info.frameStyle} overflow-hidden transition-all duration-300 relative flex flex-col`}
        style={{ minHeight: '860px' }}
      >
        {/* Mobile Notch & Status Bar Simulation */}
        {info.hasNotch && (
          <div className="bg-slate-900 text-white px-5 py-2 flex items-center justify-between text-[11px] font-semibold select-none shrink-0">
            <span>09:41</span>
            {/* Dynamic Island Notch */}
            <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-white" />
              <span className="text-[10px] font-black">5G</span>
              <BatteryMedium className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        )}

        {/* Tablet Camera Dot */}
        {'hasCamera' in info && info.hasCamera && (
          <div className="bg-slate-900 py-1.5 flex items-center justify-center select-none shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700 inline-block" />
          </div>
        )}

        {/* Nested Applet Content */}
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};
