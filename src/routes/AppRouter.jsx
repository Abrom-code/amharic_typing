import { Routes, Route } from "react-router-dom";
import { Dashboard } from "../pages/Dashboard";
import StatisticsDashboard from "../pages/StatisticsDashboard";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/stats" element={<StatisticsDashboard />} />
    </Routes>
  );
};

export default AppRouter;
