import React from 'react';
import { Home, Layers, PlusCircle, History, Building2, Settings } from 'lucide-react';
import { ViewMode, Language } from '../types';
import { translations } from '../utils/translations';

interface BottomNavProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigate,
  language,
}) => {
  const t = translations[language];

  const items: { view: ViewMode; label: string; icon: React.ReactNode }[] = [
    { view: 'landing', label: t.home, icon: <Home className="w-5 h-5" /> },
    { view: 'dashboard', label: t.dashboard, icon: <Layers className="w-5 h-5" /> },
    { view: 'create-batch', label: t.newAssessment, icon: <PlusCircle className="w-5 h-5 text-[#1c5a35]" /> },
    { view: 'history', label: t.history, icon: <History className="w-5 h-5" /> },
    { view: 'procurement-centre', label: 'Centre', icon: <Building2 className="w-5 h-5" /> },
    { view: 'settings', label: t.settings, icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#ffffff]/95 backdrop-blur-md border-t border-[#cfcbb8] px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = currentView === item.view || 
            (item.view === 'create-batch' && (currentView === 'image-upload' || currentView === 'analyzing' || currentView === 'analysis-results' || currentView === 'report'));
          
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                isActive
                  ? 'text-[#1c5a35] font-extrabold'
                  : 'text-[#55665b] hover:text-[#1c2a20]'
              }`}
            >
              <div className={isActive ? 'scale-110 transition-transform' : ''}>
                {item.icon}
              </div>
              <span className="truncate max-w-[54px] mt-0.5 font-heading">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
