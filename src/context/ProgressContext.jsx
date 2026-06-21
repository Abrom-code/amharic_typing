import { createContext, useContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEYS } from "../utils/storageKeys";
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
  // arcadeScores: { time_attack: { [seconds]: { wpm, accuracy, wordsTyped, date } }, word_sprint: { [count]: { time, accuracy, date } } }
  const [arcadeScores, setArcadeScores] = useLocalStorage(
    STORAGE_KEYS.ARCADE_SCORES,
    {},
  );

  const completeLesson = (lessonId, wpm, accuracy, letterStats = null) => {
    const newCompleted = completedLessons.includes(lessonId)
      ? completedLessons
      : [...completedLessons, lessonId];
    setCompletedLessons(newCompleted);

    const currentScore = highScores[lessonId];
    const shouldUpdateScore =
      !currentScore ||
      wpm > currentScore.wpm ||
      accuracy > currentScore.accuracy;
    if (shouldUpdateScore) {
      setHighScores({ ...highScores, [lessonId]: { wpm, accuracy } });
    }

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
        letterStats: letterStats || null,
      };
      setSessions([...sessions, newSession]);
    } catch (e) {
      console.error("Failed to record session", e);
    }
  };

  // Save an arcade game result. key is e.g. "60" for time_attack or "20" for word_sprint.
  const saveArcadeScore = (mode, key, scoreData) => {
    const modeScores = arcadeScores[mode] || {};
    const existing = modeScores[key];
    // Keep best score: for time_attack higher wpm wins; for word_sprint lower time wins
    const isBetter = !existing ||
      (mode === 'time_attack' ? scoreData.wpm > existing.wpm : scoreData.time < existing.time);
    if (isBetter) {
      setArcadeScores({
        ...arcadeScores,
        [mode]: { ...modeScores, [key]: { ...scoreData, date: new Date().toISOString() } },
      });
    }
  };

  const isLessonCompleted = (lessonId) => completedLessons.includes(lessonId);
  const getLessonScore = (lessonId) => highScores[lessonId];

  return (
    <ProgressContext.Provider
      value={{
        completedLessons,
        highScores,
        sessions,
        arcadeScores,
        completeLesson,
        saveArcadeScore,
        isLessonCompleted,
        getLessonScore,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
