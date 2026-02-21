import { useState } from "react";
import { COURSE_DATA } from "../../data/courseData";
import { LEVEL_ICONS, LEVEL_NAMES } from "../../utils/constants";
import { useProgress } from "../../context/ProgressContext";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";

export const Sidebar = ({ onLessonSelect, currentLessonId }) => {
  const { isLevelUnlocked, isLessonCompleted } = useProgress();
  const [expandedLevel, setExpandedLevel] = useState("beginner");
  const navigate = useNavigate();

  const toggleLevel = (level) => {
    if (isLevelUnlocked(level)) {
      setExpandedLevel(expandedLevel === level ? null : level);
    }
  };

  return (
    <aside className="w-72 bg-gray-800 text-white overflow-y-auto">
      <div className="p-5">
        {Object.keys(COURSE_DATA).map((level) => {
          const unlocked = isLevelUnlocked(level);
          const expanded = expandedLevel === level;

          return (
            <div key={level} className="mb-4">
              <div
                onClick={() => toggleLevel(level)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  unlocked
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-900 opacity-50 cursor-not-allowed"
                }`}
              >
                <span className="text-2xl">{LEVEL_ICONS[level]}</span>
                <h3 className="text-sm font-semibold flex-1">
                  {LEVEL_NAMES[level]}
                </h3>
                {!unlocked && <span className="text-xs">🔒</span>}
              </div>

              {expanded && unlocked && (
                <div className="mt-2 space-y-1">
                  {COURSE_DATA[level].map((lesson) => {
                    const completed = isLessonCompleted(lesson.id);
                    const active = currentLessonId === lesson.id;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => onLessonSelect(lesson, level)}
                        className={`pl-12 pr-3 py-2 text-sm cursor-pointer transition-all rounded ${
                          active
                            ? "bg-blue-600 font-semibold"
                            : "hover:bg-gray-700"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{lesson.name}</span>
                          {completed && <Badge variant="success">✓</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <div className="mt-6">
          <Button onClick={() => navigate("/stats")} className="w-full">
            View Statistics
          </Button>
        </div>
      </div>
    </aside>
  );
};
