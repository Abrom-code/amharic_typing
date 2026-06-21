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
import { Star, TrendingUp, Activity, Sparkles, ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { COURSE_DATA } from "../data/courseData";
import { useProgress } from "../context/ProgressContext";

// ─── data builders ────────────────────────────────────────────────────────────

const buildSummary = (sessions = []) => {
  if (!sessions.length) return { avgWPM: 0, topSpeed: 0, overallAccuracy: 0 };
  const avgWPM = Math.round(sessions.reduce((s, r) => s + (r.wpm || 0), 0) / sessions.length);
  const topSpeed = Math.max(...sessions.map((r) => r.wpm || 0));
  const overallAccuracy = Math.round(
    sessions.reduce((s, r) => s + (r.accuracy || 0), 0) / sessions.length,
  );
  return { avgWPM, topSpeed, overallAccuracy };
};

/** Last N sessions as chart points with short date labels */
const buildSessionSeries = (sessions = [], n = 20) =>
  sessions.slice(-n).map((s, i) => ({
    name: s.date ? new Date(s.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : `#${i + 1}`,
    wpm: s.wpm || 0,
    accuracy: s.accuracy || 0,
  }));

/** Weekly average WPM */
const buildWeeklySeries = (sessions = []) => {
  if (!sessions.length) return [];
  const msPerDay = 86400000;
  const weeks = {};
  sessions.forEach((s) => {
    if (!s.date) return;
    const d = new Date(s.date);
    const day = (d.getDay() + 6) % 7;
    const key = new Date(d.getTime() - day * msPerDay).toISOString().slice(0, 10);
    if (!weeks[key]) weeks[key] = { sum: 0, count: 0 };
    weeks[key].sum += s.wpm || 0;
    weeks[key].count += 1;
  });
  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({ name: k.slice(5), wpm: Math.round(v.sum / v.count) }));
};

/** Daily average for last 30 days */
const buildDailySeries = (sessions = []) => {
  const msPerDay = 86400000;
  const today = new Date();
  const map = {};
  for (let i = 29; i >= 0; i--) {
    const key = new Date(today.getTime() - i * msPerDay).toISOString().slice(0, 10);
    map[key] = { sum: 0, count: 0 };
  }
  sessions.forEach((s) => {
    if (!s.date) return;
    const key = new Date(s.date).toISOString().slice(0, 10);
    if (!map[key]) return;
    map[key].sum += s.wpm || 0;
    map[key].count += 1;
  });
  return Object.entries(map).map(([k, v]) => ({
    name: k.slice(5),
    wpm: v.count ? Math.round(v.sum / v.count) : 0,
  }));
};

/** Progress per level: how many lessons completed out of total */
const buildLevelProgress = (completedLessons = []) =>
  Object.entries(COURSE_DATA).map(([level, lessons]) => ({
    level,
    completed: lessons.filter((l) => completedLessons.includes(l.id)).length,
    total: lessons.length,
  }));

// ─── sub-components ───────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
    <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
    <div>
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  </div>
);

const ViewToggle = ({ value, onChange }) => (
  <div className="inline-flex rounded-lg bg-gray-100 p-1 gap-1">
    {[["sessions", "Sessions"], ["weekly", "Weekly"], ["30days", "30 Days"]].map(([v, label]) => (
      <button
        key={v}
        onClick={() => onChange(v)}
        className={`px-3 py-1 text-sm rounded-md transition-all ${
          value === v ? "bg-white shadow text-blue-600 font-semibold" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 py-12">
    <BookOpen className="w-10 h-10 opacity-40" />
    <p className="text-sm">{message}</p>
  </div>
);

const LevelProgressBar = ({ level, completed, total }) => {
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const labels = { beginner: "Beginner", elementary: "Elementary", intermediate: "Intermediate", advanced: "Advanced", expert: "Expert" };
  const colors = { beginner: "bg-blue-400", elementary: "bg-green-400", intermediate: "bg-yellow-400", advanced: "bg-orange-400", expert: "bg-red-400" };
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span className="font-medium text-gray-700">{labels[level] ?? level}</span>
        <span>{completed} / {total}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colors[level] ?? "bg-blue-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ─── main page ────────────────────────────────────────────────────────────────

export const StatisticsDashboard = () => {
  const { completedLessons, sessions } = useProgress();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("sessions");

  const allSessions = sessions || [];
  const summary = useMemo(() => buildSummary(allSessions), [allSessions]);
  const levelProgress = useMemo(() => buildLevelProgress(completedLessons), [completedLessons]);
  const totalLessons = Object.values(COURSE_DATA).flat().length;

  const chartData = useMemo(() => {
    if (viewMode === "sessions") return buildSessionSeries(allSessions, 20);
    if (viewMode === "weekly")   return buildWeeklySeries(allSessions);
    if (viewMode === "30days")   return buildDailySeries(allSessions);
    return [];
  }, [viewMode, allSessions]);

  const recent = useMemo(
    () => [...allSessions].reverse().slice(0, 10),
    [allSessions],
  );

  const hasData = allSessions.length > 0;

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lessons
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<TrendingUp className="text-blue-500 w-5 h-5" />}
            label="Average WPM"
            value={summary.avgWPM || "—"}
            sub={hasData ? `from ${allSessions.length} sessions` : "no data yet"}
          />
          <StatCard
            icon={<Star className="text-yellow-500 w-5 h-5" />}
            label="Best Speed"
            value={summary.topSpeed || "—"}
            sub="WPM personal best"
          />
          <StatCard
            icon={<Sparkles className="text-green-500 w-5 h-5" />}
            label="Avg Accuracy"
            value={hasData ? `${summary.overallAccuracy}%` : "—"}
          />
          <StatCard
            icon={<Activity className="text-purple-500 w-5 h-5" />}
            label="Lessons Done"
            value={completedLessons.length}
            sub={`of ${totalLessons} total`}
          />
        </div>

        {/* ── Chart + Recent activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-base font-semibold text-gray-700 mb-4">
              {viewMode === "sessions" && "WPM — Last 20 Sessions"}
              {viewMode === "weekly"   && "WPM — Weekly Average"}
              {viewMode === "30days"   && "WPM — Last 30 Days"}
            </h3>
            {hasData && chartData.some((d) => d.wpm > 0) ? (
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      formatter={(v) => [`${v} WPM`, "Speed"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="wpm"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#3b82f6" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState message="Complete some lessons to see your speed chart." />
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <h3 className="text-base font-semibold text-gray-700 mb-4">Recent Activity</h3>
            {recent.length > 0 ? (
              <div className="space-y-2 overflow-y-auto flex-1">
                {recent.map((r, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="overflow-hidden min-w-0">
                      <div className="font-medium truncate text-sm text-gray-800">
                        {r.lessonName || r.lessonId}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {r.date ? new Date(r.date).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                      </div>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <div className="font-bold text-blue-600 text-sm">{r.wpm} WPM</div>
                      <div className="text-xs text-gray-400">{r.accuracy}% acc</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No sessions yet." />
            )}
          </div>
        </div>

        {/* ── Level progress ── */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base font-semibold text-gray-700 mb-5">Level Progress</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {levelProgress.map(({ level, completed, total }) => (
              <LevelProgressBar key={level} level={level} completed={completed} total={total} />
            ))}
          </div>
        </div>

        {/* ── Best scores per lesson (top 10 by WPM) ── */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Top Lesson Scores</h3>
          {completedLessons.length > 0 ? (() => {
            const allLessons = Object.values(COURSE_DATA).flat();
            const rows = completedLessons
              .map((id) => {
                const lesson = allLessons.find((l) => l.id === id);
                const best = allSessions
                  .filter((s) => s.lessonId === id)
                  .sort((a, b) => (b.wpm || 0) - (a.wpm || 0))[0];
                return lesson && best
                  ? { name: lesson.name, level: lesson.level, wpm: best.wpm || 0, accuracy: best.accuracy || 0 }
                  : null;
              })
              .filter(Boolean)
              .sort((a, b) => b.wpm - a.wpm)
              .slice(0, 10);

            const levelColor = { beginner: "bg-blue-100 text-blue-700", elementary: "bg-green-100 text-green-700", intermediate: "bg-yellow-100 text-yellow-700", advanced: "bg-orange-100 text-orange-700", expert: "bg-red-100 text-red-700" };

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                      <th className="text-left pb-2 font-medium">Lesson</th>
                      <th className="text-left pb-2 font-medium">Level</th>
                      <th className="text-right pb-2 font-medium">Best WPM</th>
                      <th className="text-right pb-2 font-medium">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-2 pr-4 font-medium text-gray-800 truncate max-w-[200px]">{r.name}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${levelColor[r.level] ?? "bg-gray-100 text-gray-600"}`}>
                            {r.level}
                          </span>
                        </td>
                        <td className="py-2 text-right font-bold text-blue-600">{r.wpm}</td>
                        <td className="py-2 text-right text-gray-500">{r.accuracy}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })() : (
            <EmptyState message="Complete lessons to see your top scores here." />
          )}
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
};

export default StatisticsDashboard;
