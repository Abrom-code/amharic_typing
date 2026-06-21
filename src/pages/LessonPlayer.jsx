import { useState, useEffect, useRef } from "react";
import { useTyping } from "../hooks/useTyping";
import { useTimer } from "../hooks/useTimer";
import { useSound } from "../hooks/useSound";
import { useProgress } from "../context/ProgressContext";
import { useApp } from "../context/AppContext";
import { GhostText } from "../components/typing/GhostText";
import { MetricsBar } from "../components/stats/MetricsBar";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { getGrade } from "../utils/helpers";

export const LessonPlayer = ({ lesson, levelName, onNextLesson }) => {
  const [isActive, setIsActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const inputRef = useRef(null);
  const { play } = useSound();
  const { completeLesson } = useProgress();
  const { showAchievementPopup } = useApp();

  const handleFirstKey = () => {
    if (!timerStarted) {
      setTimerStarted(true);
    }
  };

  const {
    typedText,
    wpm,
    accuracy,
    isComplete,
    letterStats,
    updateWPM,
    reset: resetTyping,
  } = useTyping(lesson.text, isActive, handleFirstKey);

  const { time, reset: resetTimer } = useTimer(timerStarted, lesson.timeLimit);

  // Reset everything when lesson changes
  useEffect(() => {
    resetTyping();
    resetTimer();
    setIsActive(false);
    setShowResults(false);
    setTimerStarted(false);
  }, [lesson.id]);

  useEffect(() => {
    if (timerStarted && time > 0) {
      updateWPM(time);
    }
  }, [time, timerStarted, updateWPM]);

  useEffect(() => {
    if (isComplete) {
      setIsActive(false);
      setTimerStarted(false);
      setShowResults(true);

      const passed =
        accuracy >= lesson.minAccuracy &&
        (!lesson.minWPM || wpm >= lesson.minWPM);

      if (passed) {
        play("success");
        completeLesson(lesson.id, wpm, accuracy, letterStats);
        showAchievementPopup(`${lesson.name} Completed!`);
      } else {
        play("error");
      }
    }
  }, [isComplete]);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleStart = () => {
    resetTyping();
    resetTimer();
    setIsActive(true);
    setTimerStarted(false);
    setShowResults(false);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      // only start if lesson is not already active and results are not showing
      if (isActive || showResults) return;

      // ignore modifier/navigation keys
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // start on printable keys or Enter/Space to emulate Start button
      if (e.key.length === 1 || e.key === "Enter" || e.key === " ") {
        handleStart();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isActive, showResults, handleStart]);

  const handleRestart = () => {
    handleStart();
  };

  const handleContinue = () => {
    setShowResults(false);
    if (onNextLesson) {
      onNextLesson();
    }
  };

  const grade = getGrade(accuracy);
  const passed =
    accuracy >= lesson.minAccuracy && (!lesson.minWPM || wpm >= lesson.minWPM);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Top: lesson title + metrics ── */}
      <div className="px-8 pt-6 pb-3 flex-shrink-0 max-w-5xl w-full mx-auto">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">{lesson.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{levelName}</p>
        </div>
        <MetricsBar wpm={wpm} accuracy={accuracy} time={time} />
      </div>

      {/* ── Middle: fixed-height scrollable ghost text box ── */}
      <div className="px-8 flex-shrink-0 max-w-5xl w-full mx-auto">
        <div className="h-52 overflow-y-auto p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
          <GhostText text={lesson.text} typedText={typedText} />
        </div>
      </div>

      {/* ── Bottom: input + controls — always visible ── */}
      <div className="px-8 pt-4 pb-6 flex-shrink-0 max-w-5xl w-full mx-auto">
        <input
          ref={inputRef}
          id="typing-input-hidden"
          type="text"
          className="w-full px-4 py-3 text-2xl font-amharic border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          disabled={!isActive}
          placeholder={isActive ? "Type here..." : "Press any key or click Start to begin"}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />

        {isActive && typedText.length === lesson.text.length && (
          <div className="mt-2 text-center text-green-600 dark:text-green-400 font-semibold animate-pulse">
            ✓ Complete! Press Enter to see results
          </div>
        )}

        <div className="flex gap-4 mt-4">
          {!isActive && !showResults && (
            <Button onClick={handleStart}>Start Lesson</Button>
          )}
          {isActive && (
            <Button variant="secondary" onClick={handleRestart}>Restart</Button>
          )}
        </div>
      </div>

      <Modal isOpen={showResults} onClose={() => setShowResults(false)}>
        <h3 className="text-3xl font-bold text-center mb-6">Lesson Complete!</h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">WPM</p>
            <p className="text-3xl font-bold">{wpm}</p>
          </div>
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Accuracy</p>
            <p className="text-3xl font-bold">{accuracy}%</p>
          </div>
          <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Grade</p>
            <p className={`text-2xl font-bold ${passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {grade}
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 max-w-md mx-auto text-center">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Expected</div>
          <div className="mt-2 flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">WPM</div>
              <div className="font-semibold">{lesson?.minWPM ?? "N/A"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Accuracy</div>
              <div className="font-semibold">
                {lesson?.minAccuracy != null ? `${lesson.minAccuracy}%` : "N/A"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-4 justify-center">
          {passed && (
            <Button variant="success" onClick={handleContinue}>Continue</Button>
          )}
          <Button variant="secondary" onClick={handleRestart}>Try Again</Button>
        </div>
      </Modal>
    </div>
  );
};
