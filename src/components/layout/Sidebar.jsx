import { useState } from "react";
import { X } from "lucide-react";
import { COURSE_DATA } from "../../data/courseData";
import { LEVEL_ICONS, LEVEL_NAMES } from "../../utils/constants";
import { useProgress } from "../../context/ProgressContext";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { useNavigate } from "react-router-dom";

export const Sidebar = ({ onLessonSelect, currentLessonId, onClose }) => {
  const { isLessonCompleted } = useProgress();
  const [expandedLevel, setExpandedLevel] = useState(null);
  const navigate = useNavigate();

  const toggleLevel = (level) => {
    setExpandedLevel(expandedLevel === level ? null : level);
  };

  const handleLessonClick = (lesson, level) => {
    onLessonSelect(lesson, level);
    // close drawer on mobile after selection
    if (onClose) onClose();
  };

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <aside className="w-72 bg-gray-800 dark:bg-gray-950 text-white overflow-y-auto flex-shrink-0 flex flex-col h-full">
      {/* Close button — only shown when used as a drawer on mobile */}
      {onClose && (
        <div className="flex justify-end px-4 pt-4 flex-shrink-0">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="p-5 flex-1 overflow-y-auto">
        {Object.keys(COURSE_DATA).map((level) => {
          const expanded = expandedLevel === level;

          return (
            <div key={level} className="mb-4">
              <div
                onClick={() => toggleLevel(level)}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all bg-gray-700 hover:bg-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <span className="text-2xl">{LEVEL_ICONS[level]}</span>
                <h3 className="text-sm font-semibold flex-1">{LEVEL_NAMES[level]}</h3>
                <span className="text-gray-400 text-xs">{expanded ? '▲' : '▼'}</span>
              </div>

              {expanded && (
                <div className="mt-2 space-y-1">
                  {COURSE_DATA[level].map((lesson) => {
                    const completed = isLessonCompleted(lesson.id);
                    const active = currentLessonId === lesson.id;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson, level)}
                        className={`pl-12 pr-3 py-2 text-sm cursor-pointer transition-all rounded ${
                          active
                            ? "bg-blue-600 font-semibold"
                            : "hover:bg-gray-700 dark:hover:bg-gray-800"
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

        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={() => handleNav("/games")} className="w-full" variant="primary">
            🎮 Games &amp; Arcade
          </Button>
          <Button onClick={() => handleNav("/stats")} className="w-full" variant="secondary">
            View Statistics
          </Button>
        </div>
      </div>
    </aside>
  );
};
