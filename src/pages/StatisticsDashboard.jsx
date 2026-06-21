import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Star, TrendingUp, Activity, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { COURSE_DATA } from "../data/courseData";
import { useProgress } from "../context/ProgressContext";

// Mock stats engine (Logic remains the same)
const buildStats = (userHistory = []) => {
  const sessions = userHistory.slice(-10);
  const wpmSeries = sessions.map((s, i) => ({
    name: `S${i + 1}`,
    wpm: s.wpm || 0,
    date: s.date,
  }));

  const avgWPM = sessions.length
    ? Math.round(
        sessions.reduce((a, b) => a + (b.wpm || 0), 0) / sessions.length,
      )
    : 0;
  const topSpeed = sessions.length
    ? Math.max(...sessions.map((s) => s.wpm || 0))
    : 0;
  const overallAccuracy = sessions.length
    ? Math.round(
        sessions.reduce((a, b) => a + (b.accuracy || 0), 0) / sessions.length,
      )
    : 0;

  const letters = {};
  const groups = [
    "ሀ",
    "ለ",
    "ሐ",
    "መ",
    "ሠ",
    "ረ",
    "ሰ",
    "ሸ",
    "ቀ",
    "በ",
    "ተ",
    "ነ",
    "ከ",
    "ወ",
    "ደ",
    "ገ",
    "ጠ",
    "ፈ",
  ];
  groups.forEach((g) => {
    letters[g] = { correct: 0, total: 0 };
  });

  userHistory.forEach((s) => {
    if (!s.letterStats) return;
    Object.entries(s.letterStats).forEach(([k, v]) => {
      if (!letters[k]) letters[k] = { correct: 0, total: 0 };
      letters[k].correct += v.correct || 0;
      letters[k].total += v.total || 0;
    });
  });

  const heatmap = Object.entries(letters).map(([k, v]) => ({
    letter: k,
    accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 100,
  }));

  const recent = [...userHistory].slice(-5).reverse();
  return { wpmSeries, avgWPM, topSpeed, overallAccuracy, heatmap, recent };
};

// Build weekly average series from sessions (group by week start)
const buildWeeklySeries = (userHistory = []) => {
  if (!userHistory || userHistory.length === 0) return [];

  const msPerDay = 24 * 60 * 60 * 1000;
  const weeks = {};

  userHistory.forEach((s) => {
    if (!s.date) return;
    const d = new Date(s.date);
    // normalize to week start (Monday)
    const day = (d.getDay() + 6) % 7; // 0=Mon
    const weekStart = new Date(d.getTime() - day * msPerDay);
    const key = weekStart.toISOString().slice(0, 10);
    if (!weeks[key]) weeks[key] = { sum: 0, count: 0 };
    weeks[key].sum += s.wpm || 0;
    weeks[key].count += 1;
  });

  const series = Object.entries(weeks)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => ({ name: k, wpm: Math.round(v.sum / v.count) }));

  return series;
};

// Build daily average for the last 30 days
const buildDailySeries = (userHistory = [], days = 30) => {
  if (!userHistory || userHistory.length === 0) return [];
  const msPerDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  const start = new Date(today.getTime() - (days - 1) * msPerDay);

  const map = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * msPerDay);
    const key = d.toISOString().slice(0, 10);
    map[key] = { sum: 0, count: 0 };
  }

  userHistory.forEach((s) => {
    if (!s.date) return;
    const key = new Date(s.date).toISOString().slice(0, 10);
    if (!map[key]) return;
    map[key].sum += s.wpm || 0;
    map[key].count += 1;
  });

  return Object.entries(map).map(([k, v]) => ({
    name: k,
    wpm: v.count ? Math.round(v.sum / v.count) : 0,
  }));
};

export const StatisticsDashboard = () => {
  const { completedLessons, sessions, highScores } = useProgress();
  const navigate = useNavigate();
  const stats = buildStats(sessions || []);
  const [viewMode, setViewMode] = useState("sessions");

  const TimeSelector = () => (
    <div className="inline-flex rounded-md bg-white/0 p-1">
      <button
        onClick={() => setViewMode("sessions")}
        className={`px-3 py-1 text-sm rounded ${viewMode === "sessions" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
      >
        Sessions
      </button>
      <button
        onClick={() => setViewMode("weekly")}
        className={`px-3 py-1 text-sm rounded ${viewMode === "weekly" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
      >
        Weekly
      </button>
      <button
        onClick={() => setViewMode("30days")}
        className={`px-3 py-1 text-sm rounded ${viewMode === "30days" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
      >
        30 Days
      </button>
    </div>
  );

  const chartData = useMemo(() => {
    if (viewMode === "sessions") return stats.wpmSeries;
    if (viewMode === "weekly") return buildWeeklySeries(sessions || []);
    if (viewMode === "30days") return buildDailySeries(sessions || [], 30);
    return stats.wpmSeries;
  }, [viewMode, sessions, stats.wpmSeries]);

  return (
    <div className="pt-10 h-full w-full overflow-y-auto bg-gray-100">
      <div className="relative flex items-center justify-between mb-4 px-4 md:px-8">
        <div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold tracking-tight text-gray-900">
          Statistics
        </h1>

        <div className="absolute right-4">
          <TimeSelector />
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <p className="text-sm text-gray-500 text-center">
          Performance Dashboard
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp className="text-blue-500" />}
            label="Average WPM"
            value={stats.avgWPM}
          />
          <StatCard
            icon={<Star className="text-yellow-500" />}
            label="Top Speed"
            value={stats.topSpeed}
          />
          <StatCard
            icon={<Sparkles className="text-green-500" />}
            label="Overall Accuracy"
            value={`${stats.overallAccuracy}%`}
          />
          <StatCard
            icon={<Activity className="text-purple-500" />}
            label="Lessons Completed"
            value={completedLessons.length}
          />
        </div>

        {/* Middle Row - Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Speed Over Last Sessions
          </h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#3b82f6" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alphabet Grid */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Alphabet Proficiency
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {/** Build group-level stats from COURSE_DATA beginner lessons and highScores/sessions **/}
              {(() => {
                // Build groups and lesson mapping from COURSE_DATA.beginner
                const lessonsByGroup = {};
                (COURSE_DATA.beginner || []).forEach((lesson) => {
                  if (!lesson) return;
                  let key = null;

                  // Try to parse group name from the lesson name like "Lesson 1: ሀ Group"
                  if (lesson.name) {
                    const m = lesson.name.match(
                      /(?:Lesson\s*\d+:)?\s*(.+?)\s+Group$/i,
                    );
                    if (m && m[1]) {
                      key = m[1].trim().split(/\s+/)[0];
                    }
                  }

                  // Fallback to first token from lesson.text
                  if (!key && lesson.text) {
                    const t = lesson.text.split(/\s+/).find(Boolean);
                    if (t) key = t;
                  }

                  if (!key) key = lesson.id; // last resort

                  lessonsByGroup[key] = lessonsByGroup[key] || [];
                  lessonsByGroup[key].push(lesson.id);
                });

                const groups = Object.keys(lessonsByGroup);

                const groupTiles = groups.map((g) => {
                  const ids = lessonsByGroup[g] || [];
                  // collect accuracies from highScores if available
                  const accuracies = ids
                    .map((id) =>
                      highScores && highScores[id]
                        ? highScores[id].accuracy
                        : null,
                    )
                    .filter((v) => v != null);

                  let accuracy = 0;
                  if (accuracies.length) {
                    accuracy = Math.round(
                      accuracies.reduce((a, b) => a + b, 0) / accuracies.length,
                    );
                  } else {
                    // fallback: compute from sessions for these lesson ids
                    const sess = (sessions || []).filter((s) =>
                      ids.includes(s.lessonId),
                    );
                    if (sess.length) {
                      accuracy = Math.round(
                        sess.reduce((a, b) => a + (b.accuracy || 0), 0) /
                          sess.length,
                      );
                    } else {
                      accuracy = 0;
                    }
                  }

                  return { group: g, accuracy };
                });

                return groupTiles.map((h) => (
                  <div
                    key={h.group}
                    className={`p-3 rounded-lg text-center transition-colors ${
                      h.accuracy >= 90
                        ? "bg-green-50 border border-green-200"
                        : h.accuracy >= 75
                          ? "bg-yellow-50 border border-yellow-200"
                          : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="text-2xl font-amharic mb-1">{h.group}</div>
                    <div className="text-xs font-medium text-gray-500">
                      {h.accuracy}%
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Right Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {stats.recent.length > 0 ? (
                  stats.recent.map((r, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="overflow-hidden">
                        <div className="font-semibold truncate text-sm">
                          {r.lessonName || `Lesson ${r.lessonId}`}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                          {new Date(r.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right ml-2">
                        <div className="font-bold text-blue-600 text-sm">
                          {r.wpm} WPM
                        </div>
                        <div className="text-xs text-gray-500">
                          {r.accuracy}% Acc
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No sessions yet.</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="font-semibold mb-3 text-gray-700">
                What to Practice Next
              </h4>
              <div className="flex flex-wrap gap-2">
                {stats.heatmap
                  .filter((h) => h.accuracy < 75)
                  .slice(0, 5)
                  .map((h) => (
                    <span
                      key={h.letter}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold"
                    >
                      {h.letter} ({h.accuracy}%)
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Extra bottom spacing to ensure it doesn't clip */}
        <div className="h-8" />
      </div>
    </div>
  );
};

// Sub-component for clean code
const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
    <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
    <div>
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </div>
  </div>
);

export default StatisticsDashboard;
