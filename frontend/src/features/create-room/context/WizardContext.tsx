/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import type { WorldSettings, WorldConfig } from '@/types/contracts';
import { useI18n } from '../../../i18n';

interface WizardContextType {
  settings: WorldSettings & Partial<WorldConfig>;
  updateSetting: <K extends keyof (WorldSettings & WorldConfig)>(
    key: K,
    value: (WorldSettings & WorldConfig)[K]
  ) => void;
  updateDMStyle: <K extends keyof typeof initialSettingsBase.dmStyle>(
    key: K,
    value: (typeof initialSettingsBase.dmStyle)[K]
  ) => void;
  setSettings: React.Dispatch<React.SetStateAction<WorldSettings & Partial<WorldConfig>>>;
}

const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) throw new Error('useWizard must be used within WizardProvider');
  return context;
}

const initialSettingsBase = {
  seed: '',
  worldType: 'terra',
  worldSize: 'small',
  theme: 'High Fantasy',
  setting: 'Medieval Kingdom',
  tone: 'Heroic',
  worldBackground: '',
  dmStyle: {
    verbosity: 1,
    detail: 1,
    engagement: 1,
    narrative: 1,
    specialMode: null as string | null,
    customDirectives: '',
  },
  dmSystemPrompt: '',
  playerCount: 4,
  adventureLength: 'short',
  difficulty: 'easy',
  startingLevel: 1,
  attributePointBudget: 27,
  // Default WorldConfig params
  globalScale: 0.01,
  seaLevel: 0,
  elevationScale: 1,
  roughness: 0.5,
  detail: 4,
  moistureScale: 1,
  temperatureOffset: 0,
  structureChance: 0.1,
  structureSpacing: 50, // Approx 1600ft regions
  structureSizeAvg: 10,
  roadDensity: 0.5,
  fogRadius: 10,
};

export function WizardProvider({
  children,
  initialValues,
}: {
  children: ReactNode;
  initialValues?: Partial<WorldSettings>;
}) {
  const { language } = useI18n(); // Just to get default language if needed?

  const [settings, setSettingsState] = useState<WorldSettings & Partial<WorldConfig>>({
    ...initialSettingsBase,
    seed: '', // Initialize empty, set in effect
    language: language || 'en',
    ...initialValues,
  } as WorldSettings & Partial<WorldConfig>);

  // Handle seed generation purely (client-side only)
  useEffect(() => {
    // If we have no seed, or if we have a seed but it's not in generationParams (sync issue)
    const currentSeed = settings.seed || (settings.generationParams as WorldConfig)?.seed;

    if (!currentSeed && !initialValues?.seed) {
      const newSeed = `daicer-${Math.random().toString(36).substring(7)}`;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettingsState((prev: WorldSettings & Partial<WorldConfig>) => ({
        ...prev,
        seed: newSeed,
        // Ensure it is also in generationParams for the renderer
        generationParams: {
          ...(prev.generationParams as WorldConfig),
          seed: newSeed,
        },
      }));
    }
  }, []); // Run once on mount

  const updateSetting = useCallback(
    <K extends keyof (WorldSettings & WorldConfig)>(key: K, value: (WorldSettings & WorldConfig)[K]) => {
      setSettingsState((prev: WorldSettings & Partial<WorldConfig>) => ({ ...prev, [key]: value }));
    },
    []
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateDMStyle = useCallback(<K extends keyof typeof initialSettingsBase.dmStyle>(key: K, value: any) => {
    setSettingsState((prev: WorldSettings & Partial<WorldConfig>) => ({
      ...prev,
      dmStyle: { ...prev.dmStyle, [key]: value },
    }));
  }, []);

  const contextValue = useMemo(
    () => ({
      settings,
      updateSetting,
      updateDMStyle,
      setSettings: setSettingsState,
    }),
    [settings, updateSetting, updateDMStyle]
  );

  return <WizardContext.Provider value={contextValue}>{children}</WizardContext.Provider>;
}
