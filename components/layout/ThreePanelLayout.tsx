import React from 'react';

interface ThreePanelLayoutProps {
  sidebar?: React.ReactNode;
  mainContent: React.ReactNode;
  rightPanel?: React.ReactNode;
  sidebarWidth?: string; // Tailwind width class, e.g., 'w-64', 'w-72', 'w-80'
  mainContentWidth?: string; // Optional fixed width for main content
  rightPanelWidth?: string; // Optional, only used if fixedRightPanel is true
  fixedRightPanel?: boolean; // Whether right panel should have fixed width or fill available space
}

const ThreePanelLayout: React.FC<ThreePanelLayoutProps> = ({
  sidebar,
  mainContent,
  rightPanel,
  sidebarWidth = 'w-20', // Default is just icons
  mainContentWidth = 'w-[600px]', // Default fixed width for main content
  rightPanelWidth = 'w-[340px]', // Fixed width for when fixedRightPanel is true
  fixedRightPanel = false // By default, right panel will fill available space
}) => {
  return (
    <div className="flex h-screen w-full bg-gray-900 overflow-hidden">
      {/* Left Sidebar Panel - Always visible */}
      <div className={`${sidebarWidth} flex-shrink-0 overflow-y-auto bg-gray-900 border-r border-gray-700`}>
        {sidebar}
      </div>

      {/* Main Content Panel - Fixed width */}
      <div className={`${mainContentWidth} flex-shrink-0 overflow-y-auto`}>
        <div className="w-full h-full">
          {mainContent}
        </div>
      </div>

      {/* Right Panel - Either fixed width or grows to fill space */}
      <div className={`${fixedRightPanel ? rightPanelWidth : 'flex-grow'} border-l border-gray-700 bg-gray-800 overflow-y-auto`}>
        {rightPanel || (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4"></div>
              <p className="text-sm">Right Panel</p>
              <p className="text-xs mt-2">Coming Soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreePanelLayout;
