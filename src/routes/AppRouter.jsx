import { Routes, Route } from "react-router-dom";
import { Dashboard } from "../pages/Dashboard";
import StatisticsDashboard from "../pages/StatisticsDashboard";
import GamesHub from "../pages/GamesHub";
import FallingWords from "../pages/games/FallingWords";
import ZombieSurvival from "../pages/games/ZombieSurvival";
import SpaceShooter from "../pages/games/SpaceShooter";
import RaceVsAI from "../pages/games/RaceVsAI";
import EndlessCombo from "../pages/games/EndlessCombo";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/stats" element={<StatisticsDashboard />} />
      <Route path="/games" element={<GamesHub />} />
      <Route path="/games/falling" element={<FallingWords />} />
      <Route path="/games/zombie" element={<ZombieSurvival />} />
      <Route path="/games/space" element={<SpaceShooter />} />
      <Route path="/games/race" element={<RaceVsAI />} />
      <Route path="/games/combo" element={<EndlessCombo />} />
    </Routes>
  );
};

export default AppRouter;
