import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Building2,
  Video,
  ClipboardCheck,
  CreditCard,
  Bell,
  Sparkles,
  Sliders,
  Search,
  Check,
  Copy,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  X,
  School,
  Info,
  Layers,
} from 'lucide-react';
import { useExam } from '../context/ExamContext';
import {
  GlobalAppConfig,
  TenantConfigRecord,
  ClassroomConfig,
  AssessmentProctoringConfig,
  SmartCardVerificationConfig,
  NotificationConfig,
  DynamicParameter,
  INITIAL_GLOBAL_CONFIG,
  INITIAL_TENANT_CONFIGS,
} from '../types/config';

type GlobalSectionId =
  | 'platform'
  | 'classroom'
  | 'assessment'
  | 'smartCard'
  | 'notifications'
  | 'integrations'
  | 'dynamicParameters';

type TenantSectionId =
  | 'organization'
  | 'classroom'
  | 'assessment'
  | 'smartCard'
  | 'notifications'
  | 'dynamicParameters';

interface SectionMeta {
  id: string;
  title: string;
  subtitle: string;
  roleBadge: 'ADMIN+' | 'SUPER ADMIN ONLY' | 'INDIVIDUAL';
  icon: React.ReactNode;
}

const GLOBAL_SECTIONS: SectionMeta[] = [
  {
    id: 'platform',
    title: 'Platform Identity',
    subtitle: 'Common multi-tenant platform defaults, master locale, version and system contact.',
    roleBadge: 'ADMIN+',
    icon: <Globe size={18} />,
  },
  {
    id: 'classroom',
    title: 'Classroom and Streaming',
    subtitle: 'Common video engine presets, cloud recording storage and default room capacities.',
    roleBadge: 'ADMIN+',
    icon: <Video size={18} />,
  },
  {
    id: 'assessment',
    title: 'Assessments and Proctoring',
    subtitle: 'Baseline quiz standards, anti-cheating policies and proctoring AI sensitivity.',
    roleBadge: 'ADMIN+',
    icon: <ClipboardCheck size={18} />,
  },
  {
    id: 'smartCard',
    title: 'Smart Card and Biometrics',
    subtitle: 'Common NFC card hardware standards, baud rates and biometric match thresholds.',
    roleBadge: 'ADMIN+',
    icon: <CreditCard size={18} />,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'Master Firebase push credentials, system SMS gateway, and default email relay.',
    roleBadge: 'ADMIN+',
    icon: <Bell size={18} />,
  },
  {
    id: 'integrations',
    title: 'Integrations',
    subtitle: 'Central system JWT keys, AI evaluation keys, Zoom/Google OAuth credentials.',
    roleBadge: 'SUPER ADMIN ONLY',
    icon: <Sparkles size={18} />,
  },
  {
    id: 'dynamicParameters',
    title: 'Others (Platform Flags)',
    subtitle: 'Platform-wide runtime feature toggles and shared infrastructure parameters.',
    roleBadge: 'ADMIN+',
    icon: <Sliders size={18} />,
  },
];

const TENANT_SECTIONS: SectionMeta[] = [
  {
    id: 'organization',
    title: 'Organization Profile',
    subtitle: 'Individual school identity, campus code, educational board affiliation and branding.',
    roleBadge: 'INDIVIDUAL',
    icon: <Building2 size={18} />,
  },
  {
    id: 'classroom',
    title: 'Classroom and Streaming',
    subtitle: 'Campus-specific video platform override, recording storage and join permissions.',
    roleBadge: 'ADMIN+',
    icon: <Video size={18} />,
  },
  {
    id: 'assessment',
    title: 'Assessments and Proctoring',
    subtitle: 'Campus-specific proctoring rules, tab switch allowances and passing thresholds.',
    roleBadge: 'ADMIN+',
    icon: <ClipboardCheck size={18} />,
  },
  {
    id: 'smartCard',
    title: 'Smart Card and Biometrics',
    subtitle: 'Campus local NFC reader IP endpoint, reader baud rate and verification gates.',
    roleBadge: 'ADMIN+',
    icon: <CreditCard size={18} />,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'Campus custom SMS sender ID, parent alert triggers and communication preferences.',
    roleBadge: 'ADMIN+',
    icon: <Bell size={18} />,
  },
  {
    id: 'dynamicParameters',
    title: 'Others (Campus Parameters)',
    subtitle: 'Custom runtime configuration keys and overrides specific to this campus.',
    roleBadge: 'ADMIN+',
    icon: <Sliders size={18} />,
  },
];

export const ConfigurationCenterView: React.FC = () => {
  const {
    globalConfig,
    tenantConfigs,
    activeTenantId,
    setActiveTenantId,
    tenants,
    configScope,
    setConfigScope,
    saveGlobalConfig,
    saveTenantConfig,
    resetTenantToGlobal,
    addToast,
  } = useExam();

  // Local draft states
  const [activeSectionId, setActiveSectionId] = useState<string>('platform');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMaskedKeys, setShowMaskedKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Draft working copies
  const [draftGlobal, setDraftGlobal] = useState<GlobalAppConfig>(() => {
    if (globalConfig && globalConfig.platform) {
      return structuredClone(globalConfig);
    }
    return structuredClone(INITIAL_GLOBAL_CONFIG);
  });

  const [draftTenantRecord, setDraftTenantRecord] = useState<TenantConfigRecord>(() => {
    const rec = tenantConfigs[activeTenantId];
    if (rec && rec.organization) {
      return structuredClone(rec);
    }
    return structuredClone(INITIAL_TENANT_CONFIGS[activeTenantId] || INITIAL_TENANT_CONFIGS['TENANT-001']);
  });

  // Keep drafts in sync when active tenant or scope changes
  useEffect(() => {
    if (globalConfig && globalConfig.platform) {
      setDraftGlobal(structuredClone(globalConfig));
    }
  }, [globalConfig]);

  useEffect(() => {
    const rec = tenantConfigs[activeTenantId];
    if (rec && rec.organization) {
      setDraftTenantRecord(structuredClone(rec));
    } else if (INITIAL_TENANT_CONFIGS[activeTenantId]) {
      setDraftTenantRecord(structuredClone(INITIAL_TENANT_CONFIGS[activeTenantId]));
    }
  }, [activeTenantId, tenantConfigs]);

  // Adjust active section when switching scopes
  useEffect(() => {
    if (configScope === 'global') {
      setActiveSectionId('platform');
    } else {
      setActiveSectionId('organization');
    }
  }, [configScope]);

  // Global field change handler
  const handleGlobalFieldChange = <K extends keyof GlobalAppConfig>(
    section: K,
    field: keyof GlobalAppConfig[K],
    value: any
  ) => {
    setDraftGlobal((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  // Tenant Organization change handler (individual to this tenant)
  const handleTenantOrganizationChange = (
    field: keyof TenantConfigRecord['organization'],
    value: string
  ) => {
    setDraftTenantRecord((prev) => ({
      ...prev,
      organization: {
        ...prev.organization,
        [field]: value,
      },
    }));
  };

  // Tenant Section field change handler
  const handleTenantSectionFieldChange = <
    K extends 'classroom' | 'assessment' | 'smartCard' | 'notifications'
  >(
    section: K,
    field: keyof TenantConfigRecord[K],
    value: any
  ) => {
    setDraftTenantRecord((prev) => ({
      ...prev,
      overriddenSections: {
        ...prev.overriddenSections,
        [section]: true,
      },
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
  };

  // Toggle override state for a section in Tenant mode
  const handleToggleTenantOverride = (
    section: 'classroom' | 'assessment' | 'smartCard' | 'notifications' | 'dynamicParameters'
  ) => {
    const isOverridden = !!draftTenantRecord.overriddenSections[section];
    if (isOverridden) {
      // Revert to global baseline
      setDraftTenantRecord((prev) => ({
        ...prev,
        overriddenSections: {
          ...prev.overriddenSections,
          [section]: false,
        },
        [section]: structuredClone(draftGlobal[section]),
      }));
      addToast('Inherited from Global', `Reverted ${section} to global defaults for this campus.`, 'info');
    } else {
      // Mark as overridden
      setDraftTenantRecord((prev) => ({
        ...prev,
        overriddenSections: {
          ...prev.overriddenSections,
          [section]: true,
        },
      }));
      addToast('Override Enabled', `You can now customize ${section} specifically for this campus.`, 'info');
    }
  };

  // Copy helper
  const handleCopyKey = (keyName: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
    addToast('Copied', `${keyName} copied to clipboard.`, 'info');
  };

  const toggleShowKey = (keyName: string) => {
    setShowMaskedKeys((prev) => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  // Dynamic Parameter management
  const [newParamKey, setNewParamKey] = useState('');
  const [newParamVal, setNewParamVal] = useState('');
  const [newParamDesc, setNewParamDesc] = useState('');

  const handleAddDynamicParam = () => {
    if (!newParamKey.trim()) {
      addToast('Validation', 'Please enter a valid parameter key name.', 'warning');
      return;
    }
    const newParam: DynamicParameter = {
      id: 'dp-' + Date.now().toString(36),
      key: newParamKey.trim().toLowerCase().replace(/\s+/g, '_'),
      value: newParamVal.trim(),
      description: newParamDesc.trim(),
      enabled: true,
    };

    if (configScope === 'global') {
      setDraftGlobal((prev) => ({
        ...prev,
        dynamicParameters: [...prev.dynamicParameters, newParam],
      }));
    } else {
      setDraftTenantRecord((prev) => ({
        ...prev,
        overriddenSections: { ...prev.overriddenSections, dynamicParameters: true },
        dynamicParameters: [...prev.dynamicParameters, newParam],
      }));
    }
    setNewParamKey('');
    setNewParamVal('');
    setNewParamDesc('');
    addToast('Parameter Added', `Created key "${newParam.key}"`, 'success');
  };

  const handleRemoveDynamicParam = (id: string) => {
    if (configScope === 'global') {
      setDraftGlobal((prev) => ({
        ...prev,
        dynamicParameters: prev.dynamicParameters.filter((p) => p.id !== id),
      }));
    } else {
      setDraftTenantRecord((prev) => ({
        ...prev,
        overriddenSections: { ...prev.overriddenSections, dynamicParameters: true },
        dynamicParameters: prev.dynamicParameters.filter((p) => p.id !== id),
      }));
    }
    addToast('Parameter Removed', 'Custom parameter deleted.', 'info');
  };

  const handleToggleDynamicParam = (id: string) => {
    if (configScope === 'global') {
      setDraftGlobal((prev) => ({
        ...prev,
        dynamicParameters: prev.dynamicParameters.map((p) =>
          p.id === id ? { ...p, enabled: !p.enabled } : p
        ),
      }));
    } else {
      setDraftTenantRecord((prev) => ({
        ...prev,
        overriddenSections: { ...prev.overriddenSections, dynamicParameters: true },
        dynamicParameters: prev.dynamicParameters.map((p) =>
          p.id === id ? { ...p, enabled: !p.enabled } : p
        ),
      }));
    }
  };

  // Save changes
  const handleSave = () => {
    if (configScope === 'global') {
      saveGlobalConfig(draftGlobal);
    } else {
      saveTenantConfig(activeTenantId, draftTenantRecord);
    }
  };

  // Revert changes
  const handleCancel = () => {
    if (configScope === 'global') {
      setDraftGlobal(structuredClone(globalConfig));
    } else {
      const rec = tenantConfigs[activeTenantId];
      if (rec) setDraftTenantRecord(structuredClone(rec));
    }
    addToast('Changes Reverted', 'Draft has been reset.', 'info');
  };

  const currentSections = configScope === 'global' ? GLOBAL_SECTIONS : TENANT_SECTIONS;

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return currentSections;
    const q = searchQuery.toLowerCase();
    return currentSections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.subtitle.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
    );
  }, [currentSections, searchQuery]);

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Configuration Center
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Centralized settings workspace with scoped access control.
          </p>
        </div>

        {/* SuperAdmin Role Badge */}
        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[11px] font-bold tracking-wider uppercase text-[var(--text-secondary)] shadow-2xs font-mono">
            ROLE: <span className="text-[var(--primary)] font-black">SUPER_ADMIN</span>
          </span>
        </div>
      </div>

      {/* Top 3 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Sections Card */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs">
          <p className="text-xs font-semibold text-[var(--text-secondary)]">Total sections</p>
          <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-1">
            {currentSections.length}
          </p>
        </div>

        {/* Editable for you Card */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs">
          <p className="text-xs font-semibold text-[var(--text-secondary)]">Editable for you</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              {currentSections.length}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Full Access
            </span>
          </div>
        </div>

        {/* Access Model Card */}
        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs">
          <p className="text-xs font-semibold text-[var(--text-secondary)]">Access model</p>
          <p className="text-base sm:text-lg font-bold text-[var(--text-primary)] mt-1 truncate">
            {configScope === 'global'
              ? 'Global (Common to all Tenants)'
              : `Tenant Scoped (${activeTenant?.code || 'Campus'})`}
          </p>
        </div>
      </div>

      {/* Scope Switcher Tabs (Global Config vs Tenant-wise Config) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfigScope('global')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              configScope === 'global'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
            }`}
          >
            Global Config (Common)
          </button>
          <button
            type="button"
            onClick={() => setConfigScope('tenant')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              configScope === 'tenant'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
            }`}
          >
            Tenant-wise Config (Individual)
          </button>
        </div>

        {/* Global Scope Banner explaining Organization is Individual */}
        {configScope === 'global' && (
          <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
              <Globe size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--text-primary)]">
                Platform-Wide Global Baseline
              </p>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Settings configured here are common to all school tenants by default.{' '}
                <span className="font-semibold text-[var(--primary)]">
                  Individual school identities, campus codes, and affiliations are managed individually under Tenant-wise Config.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Tenant Picker Bar (Displayed when Tenant-wise Config is active) */}
        {configScope === 'tenant' && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center shrink-0">
                <School size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                  Campus / Institution Selector (Individual Settings)
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] truncate">
                  Organization profile is individual to this tenant. Other sections can override or inherit from Global.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={activeTenantId}
                onChange={(e) => setActiveTenantId(e.target.value)}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => resetTenantToGlobal(activeTenantId)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)] transition-colors cursor-pointer"
                title="Revert overridden classroom/assessment/smart card/notifications back to global defaults"
              >
                <RotateCcw size={13} />
                <span>Reset Overrides to Global</span>
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search configuration sections..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout (Sidebar + Content Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sections Sidebar */}
        <div className="lg:col-span-3 space-y-2 sticky top-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {configScope === 'global' ? 'GLOBAL SECTIONS (COMMON)' : 'TENANT SECTIONS (INDIVIDUAL)'}
            </p>
          </div>

          <div className="space-y-1.5">
            {filteredSections.map((section) => {
              const isActive = activeSectionId === section.id;
              const isOverridden =
                configScope === 'tenant' &&
                draftTenantRecord.overriddenSections[
                  section.id as keyof TenantConfigRecord['overriddenSections']
                ];

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                    setActiveSectionId(section.id);
                    const el = document.getElementById(`section-${section.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
                    isActive
                      ? 'border-[var(--primary)] bg-amber-500/10 text-[var(--text-primary)] font-bold'
                      : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`shrink-0 transition-colors ${
                        isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {section.icon}
                    </span>
                    <span className="text-xs truncate">{section.title}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isOverridden && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" title="Campus override active" />
                    )}
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        section.roleBadge === 'SUPER ADMIN ONLY'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : section.roleBadge === 'INDIVIDUAL'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {section.roleBadge === 'SUPER ADMIN ONLY'
                        ? 'Super Admin'
                        : section.roleBadge === 'INDIVIDUAL'
                        ? 'Individual'
                        : 'Admin+'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Configuration Cards */}
        <div className="lg:col-span-9 space-y-6">
          {/* ============================================================ */}
          {/* GLOBAL CONFIGURATION SECTIONS */}
          {/* ============================================================ */}
          {configScope === 'global' && (
            <>
              {/* Global Section 1: Platform Identity */}
              <section
                id="section-platform"
                className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                      <Globe size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">
                        Platform Identity & Master Locale
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Common enterprise system defaults, master language, timezone and platform support.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      COMMON (GLOBAL)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      ADMIN+
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Multi-Tenant Platform Name
                    </label>
                    <input
                      type="text"
                      value={draftGlobal.platform.platformName}
                      onChange={(e) =>
                        handleGlobalFieldChange('platform', 'platformName', e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      System Version
                    </label>
                    <input
                      type="text"
                      disabled
                      value={draftGlobal.platform.systemVersion}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] font-mono cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Master Default Language
                    </label>
                    <div className="relative">
                      <select
                        value={draftGlobal.platform.defaultLanguage}
                        onChange={(e) =>
                          handleGlobalFieldChange('platform', 'defaultLanguage', e.target.value)
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="English (US)">English (US)</option>
                        <option value="English (UK)">English (UK)</option>
                        <option value="Spanish (ES)">Spanish (ES)</option>
                        <option value="French (FR)">French (FR)</option>
                        <option value="Arabic (AR)">Arabic (AR)</option>
                        <option value="Hindi (HI)">Hindi (HI)</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Master System Timezone
                    </label>
                    <div className="relative">
                      <select
                        value={draftGlobal.platform.masterTimezone}
                        onChange={(e) =>
                          handleGlobalFieldChange('platform', 'masterTimezone', e.target.value)
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="UTC">UTC</option>
                        <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                        <option value="America/New_York (EST)">America/New_York (EST)</option>
                        <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                        <option value="Asia/Dubai (GST)">Asia/Dubai (GST)</option>
                        <option value="Europe/London (BST)">Europe/London (BST)</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Platform Support Email
                    </label>
                    <input
                      type="email"
                      value={draftGlobal.platform.platformSupportEmail}
                      onChange={(e) =>
                        handleGlobalFieldChange('platform', 'platformSupportEmail', e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center justify-between w-full p-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer">
                      <span className="text-xs text-[var(--text-secondary)] font-medium">
                        System Maintenance Mode (Suspend Student Logins)
                      </span>
                      <input
                        type="checkbox"
                        checked={draftGlobal.platform.maintenanceMode}
                        onChange={(e) =>
                          handleGlobalFieldChange('platform', 'maintenanceMode', e.target.checked)
                        }
                        className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </section>

              {/* Global Section 2: Classroom & Streaming */}
              <section
                id="section-classroom"
                className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                      <Video size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">
                        Classroom and Streaming (Global Baseline)
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Common virtual classroom streaming engine, media controls and cloud recording presets.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    ADMIN+
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Default Video Platform
                    </label>
                    <div className="relative">
                      <select
                        value={draftGlobal.classroom.defaultPlatform}
                        onChange={(e) =>
                          handleGlobalFieldChange('classroom', 'defaultPlatform', e.target.value)
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="in_app">In-App WebRTC (Ultra Low Latency)</option>
                        <option value="google_meet">Google Meet</option>
                        <option value="zoom">Zoom Video SDK</option>
                        <option value="ms_teams">Microsoft Teams</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Common Recording Cloud Storage
                    </label>
                    <div className="relative">
                      <select
                        value={draftGlobal.classroom.recordingStorageProvider}
                        onChange={(e) =>
                          handleGlobalFieldChange(
                            'classroom',
                            'recordingStorageProvider',
                            e.target.value
                          )
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="aws_s3">AWS S3 (Encrypted Storage)</option>
                        <option value="google_cloud">Google Cloud Storage (Standard)</option>
                        <option value="azure_blob">Azure Blob Storage</option>
                        <option value="local_encrypted">Local Encrypted Volume</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Auto-Attendance Threshold (% of duration)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={draftGlobal.classroom.autoAttendanceThresholdPct}
                      onChange={(e) =>
                        handleGlobalFieldChange(
                          'classroom',
                          'autoAttendanceThresholdPct',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Max Room Capacity (Students)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={draftGlobal.classroom.maxCapacity}
                      onChange={(e) =>
                        handleGlobalFieldChange(
                          'classroom',
                          'maxCapacity',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      Student Microphone Enabled by Default
                    </span>
                    <input
                      type="checkbox"
                      checked={draftGlobal.classroom.defaultStudentMic}
                      onChange={(e) =>
                        handleGlobalFieldChange('classroom', 'defaultStudentMic', e.target.checked)
                      }
                      className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      Student Camera Required by Default
                    </span>
                    <input
                      type="checkbox"
                      checked={draftGlobal.classroom.defaultStudentCamera}
                      onChange={(e) =>
                        handleGlobalFieldChange('classroom', 'defaultStudentCamera', e.target.checked)
                      }
                      className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      Waiting Room Required for Non-Roster Students
                    </span>
                    <input
                      type="checkbox"
                      checked={draftGlobal.classroom.requireWaitingRoom}
                      onChange={(e) =>
                        handleGlobalFieldChange('classroom', 'requireWaitingRoom', e.target.checked)
                      }
                      className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      Auto-Record Session on Instructor Launch
                    </span>
                    <input
                      type="checkbox"
                      checked={draftGlobal.classroom.autoRecordSession}
                      onChange={(e) =>
                        handleGlobalFieldChange('classroom', 'autoRecordSession', e.target.checked)
                      }
                      className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </section>

              {/* Global Section 3: Assessments & Proctoring */}
              <section
                id="section-assessment"
                className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                      <ClipboardCheck size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">
                        Assessments and Proctoring (Global Standards)
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)]">
                        System-wide quiz rules, proctoring AI sensitivity, violation limits and passing criteria.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    ADMIN+
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Proctoring AI Sensitivity
                    </label>
                    <div className="relative">
                      <select
                        value={draftGlobal.assessment.proctoringSensitivity}
                        onChange={(e) =>
                          handleGlobalFieldChange(
                            'assessment',
                            'proctoringSensitivity',
                            e.target.value
                          )
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="strict">Strict (High Alert)</option>
                        <option value="standard">Standard (Balanced)</option>
                        <option value="lenient">Lenient (Low False Alarms)</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Max Tab Switches Allowed
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={draftGlobal.assessment.maxTabSwitchesAllowed}
                      onChange={(e) =>
                        handleGlobalFieldChange(
                          'assessment',
                          'maxTabSwitchesAllowed',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Full-Screen Lock Mode
                    </label>
                    <div className="relative">
                      <select
                        value={draftGlobal.assessment.fullScreenEnforcement}
                        onChange={(e) =>
                          handleGlobalFieldChange(
                            'assessment',
                            'fullScreenEnforcement',
                            e.target.value
                          )
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="strict">Strict (Lockout on Exit)</option>
                        <option value="warning_only">Warning Toast Only</option>
                        <option value="disabled">Disabled</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Face Check Frequency (Seconds)
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={60}
                      value={draftGlobal.assessment.faceCheckIntervalSec}
                      onChange={(e) =>
                        handleGlobalFieldChange(
                          'assessment',
                          'faceCheckIntervalSec',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Passing Percentage Standard (%)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={draftGlobal.assessment.passingPercentage}
                      onChange={(e) =>
                        handleGlobalFieldChange(
                          'assessment',
                          'passingPercentage',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Grace Period for Late Turn-in (Mins)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={draftGlobal.assessment.lateSubmissionGraceMinutes}
                      onChange={(e) =>
                        handleGlobalFieldChange(
                          'assessment',
                          'lateSubmissionGraceMinutes',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      Randomize Question Order
                    </span>
                    <input
                      type="checkbox"
                      checked={draftGlobal.assessment.randomizeQuestions}
                      onChange={(e) =>
                        handleGlobalFieldChange(
                          'assessment',
                          'randomizeQuestions',
                          e.target.checked
                        )
                      }
                      className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      Randomize Option Choices
                    </span>
                    <input
                      type="checkbox"
                      checked={draftGlobal.assessment.randomizeOptions}
                      onChange={(e) =>
                        handleGlobalFieldChange('assessment', 'randomizeOptions', e.target.checked)
                      }
                      className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      Block Copy / Paste Shortcuts
                    </span>
                    <input
                      type="checkbox"
                      checked={draftGlobal.assessment.preventCopyPaste}
                      onChange={(e) =>
                        handleGlobalFieldChange('assessment', 'preventCopyPaste', e.target.checked)
                      }
                      className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </section>

              {/* Global Section 4: Smart Card & Biometrics */}
              <section
                id="section-smartCard"
                className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">
                        Smart Card and Biometrics (Hardware Standards)
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Common NFC smart card authentication protocols, biometrics and desk reader hooks.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    ADMIN+
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Default Verification Mode
                    </label>
                    <div className="relative">
                      <select
                        value={draftGlobal.smartCard.verificationMode}
                        onChange={(e) =>
                          handleGlobalFieldChange('smartCard', 'verificationMode', e.target.value)
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="nfc_and_face">NFC Smart Card + Face Biometrics</option>
                        <option value="nfc_only">NFC Smart Card Tap Only</option>
                        <option value="face_only">Webcam Facial Match Only</option>
                        <option value="roll_manual">Manual Roll Number Verification</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Face Biometric Match Threshold (%)
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={99}
                      value={draftGlobal.smartCard.faceConfidenceThresholdPct}
                      onChange={(e) =>
                        handleGlobalFieldChange(
                          'smartCard',
                          'faceConfidenceThresholdPct',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Default Smart Card Reader WebSocket URL
                    </label>
                    <input
                      type="text"
                      value={draftGlobal.smartCard.smartCardReaderEndpoint}
                      onChange={(e) =>
                        handleGlobalFieldChange(
                          'smartCard',
                          'smartCardReaderEndpoint',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Card Reader Baud Rate / Protocol
                    </label>
                    <input
                      type="text"
                      value={draftGlobal.smartCard.readerBaudRate}
                      onChange={(e) =>
                        handleGlobalFieldChange('smartCard', 'readerBaudRate', e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      Allow Teacher Manual Verification Bypass
                    </span>
                    <input
                      type="checkbox"
                      checked={draftGlobal.smartCard.allowTeacherManualBypass}
                      onChange={(e) =>
                        handleGlobalFieldChange(
                          'smartCard',
                          'allowTeacherManualBypass',
                          e.target.checked
                        )
                      }
                      className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      Require Liveness Blink / Smile Check
                    </span>
                    <input
                      type="checkbox"
                      checked={draftGlobal.smartCard.requireLivenessCheck}
                      onChange={(e) =>
                        handleGlobalFieldChange(
                          'smartCard',
                          'requireLivenessCheck',
                          e.target.checked
                        )
                      }
                      className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </section>

              {/* Global Section 5: Notifications */}
              <section
                id="section-notifications"
                className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">
                        Notifications (Global Gateways)
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Firebase Admin push credentials, SMS gateways, WhatsApp business API and email relay.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    ADMIN+
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Google Service Account JSON (FCM Push Delivery)
                  </label>
                  <textarea
                    rows={5}
                    value={draftGlobal.notifications.googleServiceAccountJson}
                    onChange={(e) =>
                      handleGlobalFieldChange(
                        'notifications',
                        'googleServiceAccountJson',
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)] leading-relaxed"
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    Firebase Admin SDK service account JSON used for platform-wide student & parent push notifications.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Default SMS Provider
                    </label>
                    <div className="relative">
                      <select
                        value={draftGlobal.notifications.defaultSmsProvider}
                        onChange={(e) =>
                          handleGlobalFieldChange(
                            'notifications',
                            'defaultSmsProvider',
                            e.target.value
                          )
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="Twilio">Twilio</option>
                        <option value="AWS SNS">AWS SNS</option>
                        <option value="Gupshup">Gupshup SMS</option>
                        <option value="MessageBird">MessageBird</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Default WhatsApp Provider
                    </label>
                    <div className="relative">
                      <select
                        value={draftGlobal.notifications.defaultWhatsappProvider}
                        onChange={(e) =>
                          handleGlobalFieldChange(
                            'notifications',
                            'defaultWhatsappProvider',
                            e.target.value
                          )
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="Twilio WhatsApp">Twilio WhatsApp</option>
                        <option value="Gupshup WhatsApp">Gupshup WhatsApp</option>
                        <option value="Meta Cloud API">Meta Cloud API</option>
                        <option value="Infobip">Infobip</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Default Email Gateway
                    </label>
                    <div className="relative">
                      <select
                        value={draftGlobal.notifications.defaultEmailProvider}
                        onChange={(e) =>
                          handleGlobalFieldChange(
                            'notifications',
                            'defaultEmailProvider',
                            e.target.value
                          )
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="Amazon SES">Amazon SES</option>
                        <option value="SendGrid">SendGrid</option>
                        <option value="Mailgun">Mailgun</option>
                        <option value="Custom SMTP">Custom SMTP Server</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Default SMS Sender ID
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      value={draftGlobal.notifications.smsSenderId}
                      onChange={(e) =>
                        handleGlobalFieldChange('notifications', 'smsSenderId', e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
              </section>

              {/* Global Section 6: Integrations (SUPER ADMIN ONLY) */}
              <section
                id="section-integrations"
                className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">
                        Central System Integrations & APIs
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)]">
                        SSO protocols, central LMS JWT keys, video conference credentials, and AI inference endpoints.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    SUPER ADMIN ONLY
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Campus Enlight Core System JWT Key
                    </label>
                    <div className="relative">
                      <input
                        type={showMaskedKeys['jwtKey'] ? 'text' : 'password'}
                        value={draftGlobal.integrations.coreSystemJwtKey}
                        onChange={(e) =>
                          handleGlobalFieldChange(
                            'integrations',
                            'coreSystemJwtKey',
                            e.target.value
                          )
                        }
                        className="w-full pl-3 pr-20 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleShowKey('jwtKey')}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          {showMaskedKeys['jwtKey'] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyKey('JWT Key', draftGlobal.integrations.coreSystemJwtKey)
                          }
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          {copiedKey === 'JWT Key' ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      Used for central multi-tenant authentication across all school nodes.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      AI Question Generator & Evaluation API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showMaskedKeys['aiKey'] ? 'text' : 'password'}
                        value={draftGlobal.integrations.aiEvaluationApiKey}
                        onChange={(e) =>
                          handleGlobalFieldChange(
                            'integrations',
                            'aiEvaluationApiKey',
                            e.target.value
                          )
                        }
                        className="w-full pl-3 pr-20 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleShowKey('aiKey')}
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          {showMaskedKeys['aiKey'] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyKey('AI API Key', draftGlobal.integrations.aiEvaluationApiKey)
                          }
                          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          {copiedKey === 'AI API Key' ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Zoom Video SDK Key
                      </label>
                      <input
                        type="text"
                        value={draftGlobal.integrations.zoomApiKey}
                        onChange={(e) =>
                          handleGlobalFieldChange('integrations', 'zoomApiKey', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Google Workspace OAuth Client ID
                      </label>
                      <input
                        type="text"
                        value={draftGlobal.integrations.googleWorkspaceDomainKey}
                        onChange={(e) =>
                          handleGlobalFieldChange(
                            'integrations',
                            'googleWorkspaceDomainKey',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Central SIS Webhook Callback URL
                      </label>
                      <input
                        type="text"
                        value={draftGlobal.integrations.sisWebhookUrl}
                        onChange={(e) =>
                          handleGlobalFieldChange('integrations', 'sisWebhookUrl', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        Webhook Signing Secret Key
                      </label>
                      <input
                        type="password"
                        value={draftGlobal.integrations.webhookSecretKey}
                        onChange={(e) =>
                          handleGlobalFieldChange(
                            'integrations',
                            'webhookSecretKey',
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Global Section 7: Dynamic Parameters */}
              <section
                id="section-dynamicParameters"
                className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                      <Sliders size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">
                        Others (Global Platform Flags)
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Platform-wide runtime feature toggles and shared infrastructure parameters.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    ADMIN+
                  </span>
                </div>

                <div className="space-y-2.5">
                  {draftGlobal.dynamicParameters.map((param) => (
                    <div
                      key={param.id}
                      className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                            {param.key}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-[var(--primary)] font-mono">
                            {param.value}
                          </span>
                        </div>
                        {param.description && (
                          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                            {param.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleToggleDynamicParam(param.id)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer ${
                            param.enabled
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {param.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveDynamicParam(param.id)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Key */}
                <div className="pt-3 border-t border-[var(--border-color)] space-y-3">
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    Add Global Parameter Key
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Data Key
                      </label>
                      <input
                        type="text"
                        value={newParamKey}
                        onChange={(e) => setNewParamKey(e.target.value)}
                        placeholder="Enter data key..."
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Data Value
                      </label>
                      <input
                        type="text"
                        value={newParamVal}
                        onChange={(e) => setNewParamVal(e.target.value)}
                        placeholder="e.g. true, 128, https://..."
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={newParamDesc}
                        onChange={(e) => setNewParamDesc(e.target.value)}
                        placeholder="Brief description..."
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDynamicParam}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--bg-main)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Property</span>
                  </button>
                </div>
              </section>
            </>
          )}

          {/* ============================================================ */}
          {/* TENANT-WISE CONFIGURATION SECTIONS (INDIVIDUAL PER CAMPUS) */}
          {/* ============================================================ */}
          {configScope === 'tenant' && (
            <>
              {/* Tenant Section 1: Organization Profile (INDIVIDUAL ONLY) */}
              <section
                id="section-organization"
                className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-amber-500/30 shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">
                        Organization Profile (Individual School Identity)
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Individual school identity, campus code, educational board affiliation and campus branding.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    INDIVIDUAL (TENANT ONLY)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5">
                  <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    <strong className="text-[var(--text-primary)]">Individual Identity:</strong>{' '}
                    Organization identity belongs exclusively to this institution (
                    <span className="font-semibold text-[var(--primary)]">{activeTenant.name}</span>
                    ). It is never shared or overwritten by global baseline changes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Campus / School Name
                    </label>
                    <input
                      type="text"
                      value={draftTenantRecord.organization.campusName}
                      onChange={(e) => handleTenantOrganizationChange('campusName', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Campus Code / Identifier
                    </label>
                    <input
                      type="text"
                      value={draftTenantRecord.organization.campusCode}
                      onChange={(e) => handleTenantOrganizationChange('campusCode', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Educational Board / Curriculum Affiliation
                    </label>
                    <div className="relative">
                      <select
                        value={draftTenantRecord.organization.affiliationBoard}
                        onChange={(e) =>
                          handleTenantOrganizationChange('affiliationBoard', e.target.value)
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="CBSE (Central Board of Secondary Education)">
                          CBSE (Central Board of Secondary Education)
                        </option>
                        <option value="ICSE (Indian Certificate of Secondary Education)">
                          ICSE (Indian Certificate of Secondary Education)
                        </option>
                        <option value="Cambridge Assessment International Education (IGCSE)">
                          Cambridge Assessment (IGCSE / A-Levels)
                        </option>
                        <option value="IB Diploma Programme (International Baccalaureate)">
                          IB Diploma Programme (IB)
                        </option>
                        <option value="State Board of Education">State Board of Education</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Campus Administrator / Principal Email
                    </label>
                    <input
                      type="email"
                      value={draftTenantRecord.organization.administratorEmail}
                      onChange={(e) =>
                        handleTenantOrganizationChange('administratorEmail', e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Campus Local Timezone
                    </label>
                    <div className="relative">
                      <select
                        value={draftTenantRecord.organization.campusTimezone}
                        onChange={(e) =>
                          handleTenantOrganizationChange('campusTimezone', e.target.value)
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York (EST)">America/New_York (EST)</option>
                        <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                        <option value="Asia/Dubai (GST)">Asia/Dubai (GST)</option>
                        <option value="Europe/London (BST)">Europe/London (BST)</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Current Academic Session
                    </label>
                    <input
                      type="text"
                      value={draftTenantRecord.organization.academicYear}
                      onChange={(e) => handleTenantOrganizationChange('academicYear', e.target.value)}
                      placeholder="e.g. 2025 - 2026"
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Campus Physical Address
                    </label>
                    <input
                      type="text"
                      value={draftTenantRecord.organization.campusAddress}
                      onChange={(e) =>
                        handleTenantOrganizationChange('campusAddress', e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      School Crest / Logo URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={draftTenantRecord.organization.institutionLogoUrl}
                        onChange={(e) =>
                          handleTenantOrganizationChange('institutionLogoUrl', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                      {draftTenantRecord.organization.institutionLogoUrl && (
                        <img
                          src={draftTenantRecord.organization.institutionLogoUrl}
                          alt="Logo Preview"
                          className="w-8 h-8 rounded-md object-cover border border-[var(--border-color)] shrink-0"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Tenant Section 2: Classroom & Streaming (Inherited / Override) */}
              <section
                id="section-classroom"
                className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                      <Video size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">
                        Classroom and Streaming
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Campus-specific video engine defaults and student capacity.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleTenantOverride('classroom')}
                    className={`text-[10px] font-bold px-3 py-1 rounded-md border transition-colors cursor-pointer ${
                      draftTenantRecord.overriddenSections.classroom
                        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    {draftTenantRecord.overriddenSections.classroom
                      ? '● Overridden for this Campus'
                      : '○ Inherited from Global'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Video Conferencing Platform
                    </label>
                    <div className="relative">
                      <select
                        value={draftTenantRecord.classroom.defaultPlatform}
                        onChange={(e) =>
                          handleTenantSectionFieldChange('classroom', 'defaultPlatform', e.target.value)
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="in_app">In-App WebRTC (Ultra Low Latency)</option>
                        <option value="google_meet">Google Meet</option>
                        <option value="zoom">Zoom Video SDK</option>
                        <option value="ms_teams">Microsoft Teams</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Max Room Capacity for this Campus
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={draftTenantRecord.classroom.maxCapacity}
                      onChange={(e) =>
                        handleTenantSectionFieldChange(
                          'classroom',
                          'maxCapacity',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      Student Microphone Allowed by Default
                    </span>
                    <input
                      type="checkbox"
                      checked={draftTenantRecord.classroom.defaultStudentMic}
                      onChange={(e) =>
                        handleTenantSectionFieldChange(
                          'classroom',
                          'defaultStudentMic',
                          e.target.checked
                        )
                      }
                      className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer">
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      Waiting Room Required by Default
                    </span>
                    <input
                      type="checkbox"
                      checked={draftTenantRecord.classroom.requireWaitingRoom}
                      onChange={(e) =>
                        handleTenantSectionFieldChange(
                          'classroom',
                          'requireWaitingRoom',
                          e.target.checked
                        )
                      }
                      className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </section>

              {/* Tenant Section 3: Assessments & Proctoring (Inherited / Override) */}
              <section
                id="section-assessment"
                className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                      <ClipboardCheck size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">
                        Assessments and Proctoring
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Campus quiz rules, proctoring AI sensitivity, and calculator permissions.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleTenantOverride('assessment')}
                    className={`text-[10px] font-bold px-3 py-1 rounded-md border transition-colors cursor-pointer ${
                      draftTenantRecord.overriddenSections.assessment
                        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    {draftTenantRecord.overriddenSections.assessment
                      ? '● Overridden for this Campus'
                      : '○ Inherited from Global'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Proctoring AI Sensitivity
                    </label>
                    <div className="relative">
                      <select
                        value={draftTenantRecord.assessment.proctoringSensitivity}
                        onChange={(e) =>
                          handleTenantSectionFieldChange(
                            'assessment',
                            'proctoringSensitivity',
                            e.target.value
                          )
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="strict">Strict (High Alert)</option>
                        <option value="standard">Standard (Balanced)</option>
                        <option value="lenient">Lenient (Low False Alarms)</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Max Tab Switches Allowed
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={draftTenantRecord.assessment.maxTabSwitchesAllowed}
                      onChange={(e) =>
                        handleTenantSectionFieldChange(
                          'assessment',
                          'maxTabSwitchesAllowed',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Passing Percentage (%)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={draftTenantRecord.assessment.passingPercentage}
                      onChange={(e) =>
                        handleTenantSectionFieldChange(
                          'assessment',
                          'passingPercentage',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draftTenantRecord.assessment.allowCalculator}
                      onChange={(e) =>
                        handleTenantSectionFieldChange('assessment', 'allowCalculator', e.target.checked)
                      }
                      className="accent-[var(--primary)] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      Allow On-Screen Scientific Calculator for this School
                    </span>
                  </label>
                </div>
              </section>

              {/* Tenant Section 4: Smart Card & Biometrics (Inherited / Override) */}
              <section
                id="section-smartCard"
                className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">
                        Smart Card and Biometrics
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Campus desk RFID reader endpoint and verification mode.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleTenantOverride('smartCard')}
                    className={`text-[10px] font-bold px-3 py-1 rounded-md border transition-colors cursor-pointer ${
                      draftTenantRecord.overriddenSections.smartCard
                        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    {draftTenantRecord.overriddenSections.smartCard
                      ? '● Overridden for this Campus'
                      : '○ Inherited from Global'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Verification Mode
                    </label>
                    <div className="relative">
                      <select
                        value={draftTenantRecord.smartCard.verificationMode}
                        onChange={(e) =>
                          handleTenantSectionFieldChange(
                            'smartCard',
                            'verificationMode',
                            e.target.value
                          )
                        }
                        className="w-full appearance-none px-3 py-2 pr-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="nfc_and_face">NFC Smart Card + Face Biometrics</option>
                        <option value="nfc_only">NFC Smart Card Tap Only</option>
                        <option value="face_only">Webcam Facial Match Only</option>
                        <option value="roll_manual">Manual Roll Number Verification</option>
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Campus NFC Reader Service URL
                    </label>
                    <input
                      type="text"
                      value={draftTenantRecord.smartCard.smartCardReaderEndpoint}
                      onChange={(e) =>
                        handleTenantSectionFieldChange(
                          'smartCard',
                          'smartCardReaderEndpoint',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
              </section>

              {/* Tenant Section 5: Notifications (Inherited / Override) */}
              <section
                id="section-notifications"
                className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">Notifications</h2>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Campus custom SMS sender ID and parent alert triggers.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleTenantOverride('notifications')}
                    className={`text-[10px] font-bold px-3 py-1 rounded-md border transition-colors cursor-pointer ${
                      draftTenantRecord.overriddenSections.notifications
                        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-[var(--bg-main)] text-[var(--text-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    {draftTenantRecord.overriddenSections.notifications
                      ? '● Overridden for this Campus'
                      : '○ Inherited from Global'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      School-Specific SMS Sender ID
                    </label>
                    <input
                      type="text"
                      maxLength={11}
                      value={draftTenantRecord.notifications.smsSenderId}
                      onChange={(e) =>
                        handleTenantSectionFieldChange(
                          'notifications',
                          'smsSenderId',
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-bold tracking-wider"
                    />
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">
                      Header printed on SMS delivery to parents of this campus (e.g. {activeTenant.code}).
                    </p>
                  </div>
                </div>
              </section>

              {/* Tenant Section 6: Dynamic Parameters */}
              <section
                id="section-dynamicParameters"
                className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                      <Sliders size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">
                        Others (Campus Custom Parameters)
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Custom parameters and feature toggles active only for this school.
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    CAMPUS SPECIFIC
                  </span>
                </div>

                <div className="space-y-2.5">
                  {draftTenantRecord.dynamicParameters.map((param) => (
                    <div
                      key={param.id}
                      className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                            {param.key}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-[var(--primary)] font-mono">
                            {param.value}
                          </span>
                        </div>
                        {param.description && (
                          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                            {param.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleToggleDynamicParam(param.id)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer ${
                            param.enabled
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {param.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveDynamicParam(param.id)}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Key */}
                <div className="pt-3 border-t border-[var(--border-color)] space-y-3">
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    Add Campus Configuration Key
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Data Key
                      </label>
                      <input
                        type="text"
                        value={newParamKey}
                        onChange={(e) => setNewParamKey(e.target.value)}
                        placeholder="e.g. campus_portal_subdomain..."
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Data Value
                      </label>
                      <input
                        type="text"
                        value={newParamVal}
                        onChange={(e) => setNewParamVal(e.target.value)}
                        placeholder="e.g. springfield.edu"
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={newParamDesc}
                        onChange={(e) => setNewParamDesc(e.target.value)}
                        placeholder="Brief description..."
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDynamicParam}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--bg-main)] hover:bg-[var(--border-color)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Property</span>
                  </button>
                </div>
              </section>
            </>
          )}

          {/* Bottom Action Bar (Cancel / Save Changes) */}
          <div className="sticky bottom-4 z-10 p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-lg flex items-center justify-end gap-3 backdrop-blur-md">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-main)] border border-transparent hover:border-[var(--border-color)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              <Save size={15} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ConfigurationCenterView;
