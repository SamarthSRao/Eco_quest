import React, { useState } from "react";
import React, { useState, useEffect } from "react";
import Tabs, { TabsList, TabsTrigger, TabsContent } from "../components/UI/Tabs";
import AqiRewards from "../components/AqiRewards";
import AqiPredictor from "../components/AqiPredictor";
import AqiChart from "../components/AqiChart";
import TemperatureSearch from "../components/TemperatureSearch";
import LogOutIcon from "../components/icons/LogOutIcon";


function Dashboard({ onLogout }) {
  // make garden the main/default tab and persist selection
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return localStorage.getItem('activeTab') || 'garden';
    } catch {
      return 'garden';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('activeTab', activeTab);
    } catch {}
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold">AQI Dashboard</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
          onClick={onLogout}
        >
          <LogOutIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
      <div className="min-h-screen bg-black text-white flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Eco Rewards</h1>
            <p className="text-xs text-gray-400">Dashboard</p>
          </div>

          <nav className="flex-1 space-y-2">
            <NavButton Icon={TreePine} label="Garden" value="garden" active={activeTab === "garden"} onClick={setActiveTab} />
            <NavButton Icon={Leaf} label="Rewards" value="rewards" active={activeTab === "rewards"} onClick={setActiveTab} />
            <NavButton Icon={Calculator} label="Predictor" value="predictor" active={activeTab === "predictor"} onClick={setActiveTab} />
            <NavButton Icon={BarChart3} label="Chart" value="chart" active={activeTab === "chart"} onClick={setActiveTab} />
            <NavButton Icon={Thermometer} label="Temperature" value="temperature" active={activeTab === "temperature"} onClick={setActiveTab} />
          </nav>

          <div className="mt-4">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800 rounded hover:bg-gray-700"
              onClick={onLogout}
            >
              <LogOutIcon className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "garden" && <VirtualGarden />}
          {activeTab === "rewards" && <AqiRewards />}
          {activeTab === "predictor" && <AqiPredictor />}
          {activeTab === "chart" && <AqiChart />}
          {activeTab === "temperature" && <TemperatureSearch />}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;