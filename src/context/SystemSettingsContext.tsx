import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemSettings, DEFAULT_SYSTEM_SETTINGS } from '../types';

interface SystemSettingsContextType {
  settings: SystemSettings;
  updateSettings: (updater: Partial<SystemSettings> | ((prev: SystemSettings) => SystemSettings)) => void;
  updateFeatures: (features: Partial<SystemSettings['features']>) => void;
  updateSla: (sla: Partial<SystemSettings['sla']>) => void;
  updateGeneral: (general: Partial<SystemSettings['general']>) => void;
  updateIntegrations: (integrations: Partial<SystemSettings['integrations']>) => void;
  resetSettingsToDefault: () => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'cmms_system_settings';

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined);

export const SystemSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all fields exist even after upgrades
        return {
          features: { ...DEFAULT_SYSTEM_SETTINGS.features, ...(parsed.features || {}) },
          sla: { ...DEFAULT_SYSTEM_SETTINGS.sla, ...(parsed.sla || {}) },
          general: { ...DEFAULT_SYSTEM_SETTINGS.general, ...(parsed.general || {}) },
          integrations: { ...DEFAULT_SYSTEM_SETTINGS.integrations, ...(parsed.integrations || {}) }
        };
      }
    } catch (e) {
      console.error('Failed to load system settings from localStorage', e);
    }
    return DEFAULT_SYSTEM_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save system settings to localStorage', e);
    }
  }, [settings]);

  const updateSettings = (updater: Partial<SystemSettings> | ((prev: SystemSettings) => SystemSettings)) => {
    setSettings(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return {
        features: { ...prev.features, ...(updater.features || {}) },
        sla: { ...prev.sla, ...(updater.sla || {}) },
        general: { ...prev.general, ...(updater.general || {}) },
        integrations: { ...prev.integrations, ...(updater.integrations || {}) }
      };
    });
  };

  const updateFeatures = (features: Partial<SystemSettings['features']>) => {
    setSettings(prev => ({
      ...prev,
      features: { ...prev.features, ...features }
    }));
  };

  const updateSla = (sla: Partial<SystemSettings['sla']>) => {
    setSettings(prev => ({
      ...prev,
      sla: { ...prev.sla, ...sla }
    }));
  };

  const updateGeneral = (general: Partial<SystemSettings['general']>) => {
    setSettings(prev => ({
      ...prev,
      general: { ...prev.general, ...general }
    }));
  };

  const updateIntegrations = (integrations: Partial<SystemSettings['integrations']>) => {
    setSettings(prev => ({
      ...prev,
      integrations: { ...prev.integrations, ...integrations }
    }));
  };

  const resetSettingsToDefault = () => {
    setSettings(DEFAULT_SYSTEM_SETTINGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
  };

  return (
    <SystemSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateFeatures,
        updateSla,
        updateGeneral,
        updateIntegrations,
        resetSettingsToDefault,
        resetToDefaults: resetSettingsToDefault
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
};

export const useSystemSettings = (): SystemSettingsContextType => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider');
  }
  return context;
};
