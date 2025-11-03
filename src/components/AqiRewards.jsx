import React, { useState } from "react";
import { BikeIcon, CarIcon, RecycleIcon, TreePineIcon, ZapIcon } from "./icons";
import Progress from "./UI/Progress";

function AqiRewards() {
  const [userPoints] = useState(320);
  const [activities] = useState([
    { id: 1, name: "Cycling", icon: BikeIcon, completed: true, points: 50 },
    { id: 2, name: "Public Transport", icon: CarIcon, completed: false, points: 30 },
    { id: 3, name: "Recycling", icon: RecycleIcon, completed: true, points: 40 },
    { id: 4, name: "Plant a Tree", icon: TreePineIcon, completed: false, points: 100 },
    { id: 5, name: "Energy Saving", icon: ZapIcon, completed: true, points: 25 },
  ]);
  const pointsToNextLevel = 500 - userPoints > 0 ? 500 - userPoints : 0;
  const progress = Math.min((userPoints / 500) * 100, 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Your Points: {userPoints}</h2>
        <Progress value={progress} />
        <p className="text-gray-400 mt-2">
          {pointsToNextLevel} points to next level!
        </p>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Activities</h3>
        <ul className="space-y-2">
          {activities.map((a) => (
            <li
              key={a.id}
              className={`flex items-center gap-3 p-2 rounded ${
                a.completed ? "bg-green-900" : "bg-gray-800"
              }`}
            >
              <a.icon className="w-5 h-5" />
              <span>{a.name}</span>
              <span className="ml-auto text-xs">{a.points} pts</span>
              {a.completed && (
                <span className="ml-2 text-green-400 text-xs">Completed</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AqiRewards;