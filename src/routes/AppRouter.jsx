import { Routes, Route } from "react-router-dom";
import { Dashboard } from "../pages/Dashboard";
import StatisticsDashboard from "../pages/StatisticsDashboard";
import ArcadePage from "../pages/ArcadePage";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/stats" element={<StatisticsDashboard />} />
      <Route path="/arcade" element={<ArcadePage />} />
    </Routes>
  );
};

export default AppRouter;
