import React from 'react';

interface TwoPanelLayoutProps {
  sidebar: React.ReactNode;
  mainContent: React.ReactNode;
}

const TwoPanelLayout: React.FC<TwoPanelLayoutProps> = ({
  sidebar,
  mainContent
}) => {
  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* Sidebar - Fixed width */}
      <div className="w-64 flex-shrink-0 border-r border-gray-700">
        {sidebar}
      </div>

      {/* Main Content Area - Flexible width */}
      <div className="flex-1 bg-gray-900 overflow-hidden">
        {mainContent}
      </div>
    </div>
  );
};

export default TwoPanelLayout;