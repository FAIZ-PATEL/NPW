import React from 'react';
import { Home, Wrench, Users, Package, MoreHorizontal, Clock, CheckCircle } from 'lucide-react';

export type NavTab = 'home' | 'jobs' | 'customers' | 'inventory' | 'more';

interface BottomNavProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  pendingCount?: number;
  repairedCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  pendingCount = 0,
  repairedCount = 0,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    {
      id: 'jobs' as NavTab,
      label: 'Jobs',
      icon: Wrench,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: 'bg-red-500',
    },
    { id: 'customers' as NavTab, label: 'Customers', icon: Users },
    { id: 'inventory' as NavTab, label: 'Inventory', icon: Package },
    { id: 'more' as NavTab, label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex-1 py-1 px-1 flex flex-col items-center justify-center relative rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`relative px-4 py-1 rounded-full transition-all ${
                  isActive ? 'bg-blue-100 text-blue-700' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 text-[10px] font-black text-white px-1.5 py-0.2 rounded-full ring-2 ring-white ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] mt-0.5 tracking-tight ${isActive ? 'font-extrabold text-blue-700' : 'text-slate-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
