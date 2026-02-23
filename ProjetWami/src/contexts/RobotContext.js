import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RobotContext = createContext();

const STORAGE_KEY = '@wami_robots';

const DEFAULT_ROBOT = {
  id: 'robot-1',
  name: 'Robot Wami 1',
  bassin: 'Bassin Principal',
  isActive: true,
  createdAt: new Date().toISOString(),
};

export function RobotProvider({ children }) {
  const [robots, setRobots] = useState([DEFAULT_ROBOT]);
  const [activeRobotId, setActiveRobotId] = useState(DEFAULT_ROBOT.id);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setRobots(data.robots || [DEFAULT_ROBOT]);
        setActiveRobotId(data.activeRobotId || DEFAULT_ROBOT.id);
      }
    } catch (error) {
      console.error('Erreur chargement robots:', error);
    }
  };

  const saveData = async (newRobots, newActiveId) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        robots: newRobots,
        activeRobotId: newActiveId,
      }));
    } catch (error) {
      console.error('Erreur sauvegarde robots:', error);
    }
  };

  const addRobot = (name, bassin) => {
    const newRobot = {
      id: 'robot-' + Date.now(),
      name,
      bassin,
      isActive: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...robots, newRobot];
    setRobots(updated);
    saveData(updated, activeRobotId);
    return newRobot;
  };

  const removeRobot = (robotId) => {
    if (robots.length <= 1) return false;
    const updated = robots.filter(r => r.id !== robotId);
    const newActiveId = activeRobotId === robotId ? updated[0].id : activeRobotId;
    setRobots(updated);
    setActiveRobotId(newActiveId);
    saveData(updated, newActiveId);
    return true;
  };

  const selectRobot = (robotId) => {
    setActiveRobotId(robotId);
    saveData(robots, robotId);
  };

  const updateRobot = (robotId, updates) => {
    const updated = robots.map(r =>
      r.id === robotId ? { ...r, ...updates } : r
    );
    setRobots(updated);
    saveData(updated, activeRobotId);
  };

  const activeRobot = robots.find(r => r.id === activeRobotId) || robots[0];

  return (
    <RobotContext.Provider value={{
      robots,
      activeRobot,
      activeRobotId,
      addRobot,
      removeRobot,
      selectRobot,
      updateRobot,
    }}>
      {children}
    </RobotContext.Provider>
  );
}

export const useRobot = () => {
  const context = useContext(RobotContext);
  if (!context) {
    throw new Error('useRobot must be used within a RobotProvider');
  }
  return context;
};
