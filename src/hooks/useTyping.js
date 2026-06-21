import { useState, useEffect } from "react";
import { calculateWPM, calculateAccuracy } from "../utils/helpers";

export const useTyping = (targetText, isActive, onFirstKey) => {
  const [typedText, setTypedText] = useState("");
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isComplete, setIsComplete] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const [errorKey, setErrorKey] = useState(null);
  // letterStats: { [char]: { correct: number, total: number } }
  const [letterStats, setLetterStats] = useState({});

  useEffect(() => {
    if (!isActive) return;

    const handleCompositionStart = () => {
      setIsComposing(true);
    };

    const handleCompositionEnd = () => {
      setIsComposing(false);
    };

    const handleKeyDown = (e) => {
      // Handle Enter key to finish lesson
      if (e.key === "Enter" && typedText.length === targetText.length) {
        setIsComplete(true);
      }
    };

    const handleInput = (e) => {
      // Get the input value
      const input = e.target.value;

      // Call onFirstKey on first character
      if (input.length === 1 && typedText.length === 0 && onFirstKey) {
        onFirstKey();
      }

      // Handle deletion
      if (input.length < typedText.length) {
        setTypedText(input);
        return;
      }

      // Don't allow typing beyond target length
      if (input.length > targetText.length) {
        e.target.value = typedText;
        return;
      }

      const newChar = input[input.length - 1];
      const expectedChar = targetText[input.length - 1];

      setTypedText(input);

      // Only count completed characters (not during composition)
      if (!isComposing && input.length > typedText.length) {
        setTotalChars((prev) => prev + 1);

        // Track per-letter stats using the expected character as the key
        setLetterStats((prev) => {
          const entry = prev[expectedChar] || { correct: 0, total: 0 };
          return {
            ...prev,
            [expectedChar]: {
              correct: entry.correct + (newChar === expectedChar ? 1 : 0),
              total: entry.total + 1,
            },
          };
        });

        if (newChar === expectedChar) {
          setCorrectChars((prev) => prev + 1);
          setActiveKey(newChar);
          setErrorKey(null);
          // Clear active key highlight after short delay
          setTimeout(() => setActiveKey(null), 150);
        } else {
          setErrorKey(expectedChar);
          setActiveKey(null);
          // Clear error key highlight after shake animation
          setTimeout(() => setErrorKey(null), 400);
        }
      }

      // Check if complete - only when not composing
      if (!isComposing && input.length === targetText.length) {
        // Small delay to ensure composition is truly finished
        setTimeout(() => {
          if (e.target.value.length === targetText.length) {
            setIsComplete(true);
          }
        }, 100);
      }
    };

    // Find the hidden input and attach listeners
    const inputElement = document.getElementById("typing-input-hidden");
    if (inputElement) {
      inputElement.addEventListener("compositionstart", handleCompositionStart);
      inputElement.addEventListener("compositionend", handleCompositionEnd);
      inputElement.addEventListener("keydown", handleKeyDown);
      inputElement.addEventListener("input", handleInput);

      return () => {
        inputElement.removeEventListener(
          "compositionstart",
          handleCompositionStart,
        );
        inputElement.removeEventListener(
          "compositionend",
          handleCompositionEnd,
        );
        inputElement.removeEventListener("keydown", handleKeyDown);
        inputElement.removeEventListener("input", handleInput);
      };
    }
  }, [isActive, typedText, targetText, onFirstKey, isComposing]);

  useEffect(() => {
    setAccuracy(calculateAccuracy(correctChars, totalChars));
  }, [correctChars, totalChars]);

  const updateWPM = (timeInSeconds) => {
    setWpm(calculateWPM(correctChars, timeInSeconds));
  };

  const reset = () => {
    setTypedText("");
    setCorrectChars(0);
    setTotalChars(0);
    setWpm(0);
    setAccuracy(100);
    setIsComplete(false);
    setIsComposing(false);
    setActiveKey(null);
    setErrorKey(null);
    setLetterStats({});

    // Clear the hidden input
    const inputElement = document.getElementById("typing-input-hidden");
    if (inputElement) {
      inputElement.value = "";
    }
  };

  return {
    typedText,
    correctChars,
    totalChars,
    wpm,
    accuracy,
    isComplete,
    activeKey,
    errorKey,
    letterStats,
    updateWPM,
    reset,
  };
};
