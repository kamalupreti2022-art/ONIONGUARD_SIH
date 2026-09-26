import React, { useState } from 'react';
import { 
  Menu, 
  Settings as SettingsIcon, 
  Home, 
  Globe2,
  ChevronDown
} from 'lucide-react';
import { Language, ViewMode } from '../types';
import { translations, LANGUAGE_LABELS } from '../utils/translations';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onToggleSidebarMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  language,
  onLanguageChange,
  onToggleSidebarMobile,
}) => {
  const t = translations[language] || translations.en;
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Requirement 2: Clean top navigation bar:
  // Remove: Dashboard, History, Procurement Centers, New Assessment.
  // The Dashboard must remain accessible through the sidebar only.
  const navItems: { view: ViewMode; label: string; icon: React.ReactNode }[] = [
    { view: 'landing', label: t.home, icon: <Home className="w-4 h-4" /> },
    { view: 'settings', label: t.settings, icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  const currentLangInfo = LANGUAGE_LABELS[language] || LANGUAGE_LABELS.en;

  return (
    <header className="sticky top-0 z-40 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#cfcbb8] shadow-xs">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#174327] border border-[#0e2f1c] flex items-center justify-center text-white shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-lg text-[#f2c14e] font-heading">OG</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-[#174327] font-heading">
                  Onion<span className="text-[#c28f2c]">Guard</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e0eee2] text-[#1c5a35] uppercase tracking-wider border border-[#bcd6c0]">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-[#55665b] hidden md:block leading-none mt-0.5 font-medium">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links (Cleaned: Dashboard/History/Procurement/NewAssessment removed) */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#1c5a35] text-white shadow-sm ring-1 ring-[#174327]'
                      : 'text-[#1c2a20] hover:bg-[#f1f6f0] hover:text-[#174327]'
                  }`}
                >
                  {item.icon}
                  <span className="font-heading text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Area: 8-Language Selector & Mobile Sidebar Toggle */}
          <div className="flex items-center gap-2 relative">
            {/* 8 Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 bg-[#f1f6f0] hover:bg-[#e6efe4] px-3 py-1.5 rounded-xl border border-[#cfcbb8] text-xs font-bold text-[#174327] transition cursor-pointer shadow-2xs"
                aria-expanded={langMenuOpen}
                aria-haspopup="true"
              >
                <Globe2 className="w-3.5 h-3.5 text-[#1c5a35]" />
                <span className="font-heading text-xs font-bold">{currentLangInfo.native}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#55665b] transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setLangMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl border border-[#cfcbb8] shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-1 text-[10px] font-bold text-[#55665b] uppercase tracking-wider border-b border-[#f1f6f0] font-heading">
                      Select Language (8)
                    </div>
                    {(Object.keys(LANGUAGE_LABELS) as Language[]).map((langKey) => {
                      const isSelected = language === langKey;
                      const langData = LANGUAGE_LABELS[langKey];
                      return (
                        <button
                          key={langKey}
                          onClick={() => {
                            onLanguageChange(langKey);
                            setLangMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#e0eee2] text-[#174327] font-bold'
                              : 'text-[#1c2a20] hover:bg-[#f1f6f0]'
                          }`}
                        >
                          <span className="font-heading">{langData.native}</span>
                          <span className="text-[10px] text-[#55665b]">{langData.english}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu toggle (opens sidebar where Dashboard is accessible) */}
            <button
              onClick={onToggleSidebarMobile}
              className="lg:hidden p-2 rounded-xl border border-[#cfcbb8] text-[#1c2a20] hover:bg-[#f1f6f0] cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
