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

  const completeLesson = (lessonId, wpm, accuracy, letterStats = null) => {
    // Update completed lessons
    const newCompleted = completedLessons.includes(lessonId)
      ? completedLessons
      : [...completedLessons, lessonId];

    setCompletedLessons(newCompleted);

    // Update high scores if this attempt is better
    const currentScore = highScores[lessonId];
    const shouldUpdateScore =
      !currentScore ||
      wpm > currentScore.wpm ||
      accuracy > currentScore.accuracy;

    if (shouldUpdateScore) {
      setHighScores({ ...highScores, [lessonId]: { wpm, accuracy } });
    }

    // Record the session
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

  const isLessonCompleted = (lessonId) => completedLessons.includes(lessonId);
  const getLessonScore = (lessonId) => highScores[lessonId];

  return (
    <ProgressContext.Provider
      value={{
        completedLessons,
        highScores,
        sessions,
        completeLesson,
        isLessonCompleted,
        getLessonScore,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
