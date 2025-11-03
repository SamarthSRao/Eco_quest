import React from "react";

function Tabs({ value, onValueChange, children, className = "" }) {
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { activeTab: value, setActiveTab: onValueChange })
      )}
    </div>
  );
}

export function TabsList({ children, className = "", activeTab, setActiveTab }) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md p-1 text-muted-foreground ${className}`}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { activeTab, setActiveTab })
      )}
    </div>
  );
}

export function TabsTrigger({ value, children, activeTab, setActiveTab }) {
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        activeTab === value ? "bg-background text-foreground shadow-sm bg-gray-800 text-white" : "text-gray-400"
      }`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, activeTab }) {
  return activeTab === value ? (
    <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      {children}
    </div>
  ) : null;
}

export default Tabs;