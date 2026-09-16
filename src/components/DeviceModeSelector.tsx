import React from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Sparkles,
  Check
} from 'lucide-react';
import { DeviceMode, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { DetectedDeviceType } from '../hooks/useDeviceDetector';

interface DeviceModeSelectorProps {
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  detectedType: DetectedDeviceType;
  language: Language;
  compact?: boolean;
}

export const DeviceModeSelector: React.FC<DeviceModeSelectorProps> = ({
  deviceMode,
  onDeviceModeChange,
  detectedType,
  language,
  compact = false,
}) => {
  const t = TRANSLATIONS[language];

  const modes: {
    id: DeviceMode;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    desc: string;
  }[] = [
    {
      id: 'auto',
      label: t.deviceAuto,
      shortLabel: language === 'ar' ? 'تلقائي' : 'Auto',
      icon: Sparkles,
      desc: language === 'ar' ? `تلقائي (${detectedType === 'mobile' ? 'تلفون' : detectedType === 'tablet' ? 'آيباد' : 'حاسبة'})` : `Auto (${detectedType})`,
    },
    {
      id: 'mobile',
      label: t.devicePhone,
      shortLabel: language === 'ar' ? 'تلفون' : 'Phone',
      icon: Smartphone,
      desc: '390 × 844 px',
    },
    {
      id: 'tablet',
      label: t.deviceTablet,
      shortLabel: language === 'ar' ? 'آيباد' : 'iPad',
      icon: Tablet,
      desc: '820 × 1180 px',
    },
    {
      id: 'desktop',
      label: t.deviceDesktop,
      shortLabel: language === 'ar' ? 'حاسبة' : 'PC',
      icon: Monitor,
      desc: '1280+ px',
    },
  ];

  if (compact) {
    return (
      <div 
        id="device-mode-selector-compact"
        className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
        role="group"
        aria-label={t.deviceModeLabel}
      >
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = deviceMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              id={`btn-device-mode-${m.id}`}
              onClick={() => onDeviceModeChange(m.id)}
              className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
              title={`${m.label} - ${m.desc}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden md:inline text-[11px]">{m.shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div 
      id="device-mode-selector"
      className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs"
    >
      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 hidden lg:inline">
        {t.deviceModeLabel}:
      </span>
      <div className="flex items-center gap-1">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = deviceMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              id={`btn-device-mode-full-${m.id}`}
              onClick={() => onDeviceModeChange(m.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 ring-1 ring-blue-500'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700'
              }`}
              title={`${m.label} (${m.desc})`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{m.shortLabel}</span>
              {isActive && <Check className="w-3 h-3 ml-0.5 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
