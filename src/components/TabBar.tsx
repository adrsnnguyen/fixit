interface Tab {
  id: string
  label: string
  icon: React.ReactNode
}

interface TabBarProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={[
                'flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 text-xs font-medium transition-colors active:scale-95',
                isActive ? 'text-primary' : 'text-muted',
              ].join(' ')}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
