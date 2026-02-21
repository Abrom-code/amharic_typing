import { createContext, useContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storageKeys";
import { LEVEL_REQUIREMENTS } from "../data/levelsConfig";
import { COURSE_DATA } from "../data/courseData";

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const [completedLessons, setCompletedLessons] = useLocalStorage(
    STORAGE_KEYS.COMPLETED_LESSONS,
    [],
  );
  const [highScores, setHighScores] = useLocalStorage(
    STORAGE_KEYS.HIGH_SCORES,
    {},
  );
  const [sessions, setSessions] = useLocalStorage(
    STORAGE_KEYS.SESSION_HISTORY,
    [],
  );
  const [unlockedLevels, setUnlockedLevels] = useLocalStorage(
    STORAGE_KEYS.UNLOCKED_LEVELS,
    ["beginner"],
  );

  const completeLesson = (lessonId, wpm, accuracy) => {
    // compute new completed lessons and high scores synchronously
    const newCompleted = completedLessons.includes(lessonId)
      ? completedLessons
      : [...completedLessons, lessonId];

    setCompletedLessons(newCompleted);

    const currentScore = highScores[lessonId];
    const shouldUpdateScore =
      !currentScore ||
      wpm > currentScore.wpm ||
      accuracy > currentScore.accuracy;
    const newHighScores = shouldUpdateScore
      ? { ...highScores, [lessonId]: { wpm, accuracy } }
      : highScores;

    if (shouldUpdateScore) setHighScores(newHighScores);

    // record the session (append to sessions history)
    try {
      const lesson = Object.values(COURSE_DATA)
        .flat()
        .find((l) => l.id === lessonId);
      const newSession = {
        lessonId,
        lessonName: lesson ? lesson.name : lessonId,
        wpm,
        accuracy,
        date: new Date().toISOString(),
        letterStats: null,
      };

      setSessions([...sessions, newSession]);
    } catch (e) {
      // ignore session recording errors
      console.error("Failed to record session", e);
    }

    // pass the updated state to checkLevelUnlock to avoid stale state issues
    checkLevelUnlock(newCompleted, unlockedLevels);
  };

  const checkLevelUnlock = (
    completed = completedLessons,
    currentUnlocked = unlockedLevels,
  ) => {
    const levels = [
      "beginner",
      "elementary",
      "intermediate",
      "advanced",
      "expert",
    ];

    const newlyUnlocked = [];

    levels.forEach((level) => {
      if (currentUnlocked.includes(level)) return;

      const requirements = LEVEL_REQUIREMENTS[level];
      if (!requirements.requiredLevel) return;

      const requiredLevelLessons =
        COURSE_DATA[requirements.requiredLevel] || [];
      const completedCount = requiredLevelLessons.filter((l) =>
        completed.includes(l.id),
      ).length;

      const completionRate = requiredLevelLessons.length
        ? completedCount / requiredLevelLessons.length
        : 0;

      // Unlock if configured completion rate met OR at least 2 lessons
      const meetsRate =
        typeof requirements.requiredCompletion === "number" &&
        completionRate >= requirements.requiredCompletion;
      const meetsMinimumCount = completedCount >= 2;

      if (meetsRate || meetsMinimumCount) {
        newlyUnlocked.push(level);
      }
    });

    if (newlyUnlocked.length) {
      // ensure uniqueness when updating
      const updated = Array.from(
        new Set([...currentUnlocked, ...newlyUnlocked]),
      );
      setUnlockedLevels(updated);
    }
  };

  const isLevelUnlocked = (level) => unlockedLevels.includes(level);
  const isLessonCompleted = (lessonId) => completedLessons.includes(lessonId);
  const getLessonScore = (lessonId) => highScores[lessonId];

  return (
    <ProgressContext.Provider
      value={{
        completedLessons,
        highScores,
        sessions,
        unlockedLevels,
        completeLesson,
        isLevelUnlocked,
        isLessonCompleted,
        getLessonScore,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
