import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Timer, Zap, Trophy, RotateCcw } from "lucide-react";
import { useProgress } from "../context/ProgressContext";
import { useSound } from "../hooks/useSound";
import { GhostText } from "../components/typing/GhostText";
import { Button } from "../components/ui/Button";
import {
  GAME_MODES,
  TIME_ATTACK_OPTIONS,
  WORD_SPRINT_OPTIONS,
  ARCADE_WORD_POOL,
} from "../utils/constants";
import { calculateWPM, calculateAccuracy, formatTime } from "../utils/helpers";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Pick `n` random words from the pool, no repeats if pool is large enough */
const pickWords = (n) => {
  const shuffled = [...ARCADE_WORD_POOL].sort(() => Math.random() - 0.5);
  const result = [];
  while (result.length < n) {
    result.push(...shuffled);
  }
  return result.slice(0, n).join(" ");
};

/** Generate a large text block for time-attack (enough chars for ~5 min at 60 WPM) */
const generateTimeAttackText = () => {
  const words = [];
  while (words.length < 200) {
    const shuffled = [...ARCADE_WORD_POOL].sort(() => Math.random() - 0.5);
    words.push(...shuffled);
  }
  return words.slice(0, 200).join(" ");
};

// ─── sub-components ─────────────────────────────────────────────────────────

const ModeCard = ({ icon, title, description, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
      active
        ? "border-blue-500 bg-blue-50"
        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
    }`}
  >
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl">{icon}</span>
      <span className="font-bold text-gray-800 text-lg">{title}</span>
    </div>
    <p className="text-sm text-gray-500">{description}</p>
  </button>
);

const OptionPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
      active
        ? "bg-blue-600 text-white shadow"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`}
  >
    {label}
  </button>
);

const ScoreBadge = ({ label, value, sub }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</div>
    <div className="text-3xl font-bold text-gray-800">{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
  </div>
);

// ─── main component ──────────────────────────────────────────────────────────

export const ArcadePage = () => {
  const navigate = useNavigate();
  const { play } = useSound();
  const { arcadeScores, saveArcadeScore } = useProgress();

  // config
  const [mode, setMode] = useState(GAME_MODES.TIME_ATTACK);
  const [timeOption, setTimeOption] = useState(TIME_ATTACK_OPTIONS[1]); // 60s default
  const [wordOption, setWordOption] = useState(WORD_SPRINT_OPTIONS[1]); // 20 words default

  // game state
  const [phase, setPhase] = useState("config"); // config | playing | results
  const [targetText, setTargetText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [isComposing, setIsComposing] = useState(false);

  // timer
  const [countdown, setCountdown] = useState(0); // counts DOWN for time attack
  const [elapsed, setElapsed] = useState(0);     // counts UP for word sprint
  const [timerActive, setTimerActive] = useState(false);
  const intervalRef = useRef(null);

  // results
  const [finalWPM, setFinalWPM] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(100);
  const [wordsCompleted, setWordsCompleted] = useState(0);

  const inputRef = useRef(null);

  // ── reset typed state ──
  const resetTyped = useCallback(() => {
    setTypedText("");
    setCorrectChars(0);
    setTotalChars(0);
    setActiveKey(null);
    setErrorKey(null);
    const el = document.getElementById("arcade-input");
    if (el) el.value = "";
  }, []);

  // ── stop timer ──
  const stopTimer = useCallback(() => {
    setTimerActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  // ── finish game ──
  const finishGame = useCallback(
    (overrideCorrect, overrideTotal, overrideElapsed, overrideTyped, targetRef) => {
      stopTimer();
      setPhase("results");
      play("success");

      const cc = overrideCorrect ?? correctChars;
      const tc = overrideTotal ?? totalChars;
      const t = overrideElapsed ?? elapsed;
      const typed = overrideTyped ?? typedText;
      const target = targetRef ?? targetText;

      const timeUsed = mode === GAME_MODES.TIME_ATTACK
        ? (overrideElapsed != null ? overrideElapsed : timeOption.seconds - countdown)
        : t;

      const wpm = calculateWPM(cc, Math.max(timeUsed, 1));
      const acc = calculateAccuracy(cc, tc);
      const words = typed.trim().split(/\s+/).filter(Boolean).length;

      setFinalWPM(wpm);
      setFinalAccuracy(acc);
      setWordsCompleted(words);

      if (mode === GAME_MODES.TIME_ATTACK) {
        saveArcadeScore(GAME_MODES.TIME_ATTACK, String(timeOption.seconds), {
          wpm, accuracy: acc, wordsTyped: words,
        });
      } else {
        saveArcadeScore(GAME_MODES.WORD_SPRINT, String(wordOption.count), {
          time: t, accuracy: acc, wpm,
        });
      }
    },
    [correctChars, totalChars, elapsed, typedText, targetText, countdown,
     mode, timeOption, wordOption, play, saveArcadeScore, stopTimer],
  );

  // ── timer tick ──
  useEffect(() => {
    if (!timerActive) return;

    intervalRef.current = setInterval(() => {
      if (mode === GAME_MODES.TIME_ATTACK) {
        setCountdown((prev) => {
          if (prev <= 1) {
            // time's up — finish with current state
            clearInterval(intervalRef.current);
            setTimerActive(false);
            setPhase("results");
            play("success");
            // Use functional form to get latest state in closure
            setCorrectChars((cc) => {
              setTotalChars((tc) => {
                setElapsed((el) => {
                  setTypedText((tt) => {
                    const timeUsed = timeOption.seconds;
                    const wpm = calculateWPM(cc, timeUsed);
                    const acc = calculateAccuracy(cc, tc);
                    const words = tt.trim().split(/\s+/).filter(Boolean).length;
                    setFinalWPM(wpm);
                    setFinalAccuracy(acc);
                    setWordsCompleted(words);
                    saveArcadeScore(GAME_MODES.TIME_ATTACK, String(timeOption.seconds), {
                      wpm, accuracy: acc, wordsTyped: words,
                    });
                    return tt;
                  });
                  return el;
                });
                return tc;
              });
              return cc;
            });
            return 0;
          }
          return prev - 1;
        });
      } else {
        setElapsed((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timerActive, mode, timeOption, play, saveArcadeScore]);

  // ── start game ──
  const startGame = () => {
    let text;
    if (mode === GAME_MODES.TIME_ATTACK) {
      text = generateTimeAttackText();
      setCountdown(timeOption.seconds);
      setElapsed(0);
    } else {
      text = pickWords(wordOption.count);
      setElapsed(0);
      setCountdown(0);
    }
    setTargetText(text);
    resetTyped();
    setPhase("playing");
    setTimerActive(false); // timer starts on first keypress
    setFinalWPM(0);
    setFinalAccuracy(100);
    setWordsCompleted(0);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  // ── input handling ──
  useEffect(() => {
    if (phase !== "playing") return;

    const el = document.getElementById("arcade-input");
    if (!el) return;

    const onCompositionStart = () => setIsComposing(true);
    const onCompositionEnd = () => setIsComposing(false);

    const onInput = (e) => {
      const input = e.target.value;

      // Start timer on first character
      if (input.length === 1 && typedText.length === 0) {
        setTimerActive(true);
      }

      // Allow deletion freely
      if (input.length < typedText.length) {
        setTypedText(input);
        return;
      }

      // Don't allow typing past target
      if (input.length > targetText.length) {
        e.target.value = typedText;
        return;
      }

      const newChar = input[input.length - 1];
      const expectedChar = targetText[input.length - 1];
      setTypedText(input);

      if (!isComposing && input.length > typedText.length) {
        setTotalChars((p) => p + 1);
        if (newChar === expectedChar) {
          setCorrectChars((p) => p + 1);
        }
      }

      // Word Sprint: finish when all words typed
      if (mode === GAME_MODES.WORD_SPRINT && input.length === targetText.length) {
        setTimeout(() => {
          if (document.getElementById("arcade-input")?.value.length === targetText.length) {
            setElapsed((el) => {
              setCorrectChars((cc) => {
                setTotalChars((tc) => {
                  const wpm = calculateWPM(cc, Math.max(el, 1));
                  const acc = calculateAccuracy(cc, tc);
                  const words = wordOption.count;
                  setFinalWPM(wpm);
                  setFinalAccuracy(acc);
                  setWordsCompleted(words);
                  saveArcadeScore(GAME_MODES.WORD_SPRINT, String(wordOption.count), {
                    time: el, accuracy: acc, wpm,
                  });
                  return tc;
                });
                return cc;
              });
              return el;
            });
            stopTimer();
            setPhase("results");
            play("success");
          }
        }, 100);
      }
    };

    el.addEventListener("compositionstart", onCompositionStart);
    el.addEventListener("compositionend", onCompositionEnd);
    el.addEventListener("input", onInput);
    return () => {
      el.removeEventListener("compositionstart", onCompositionStart);
      el.removeEventListener("compositionend", onCompositionEnd);
      el.removeEventListener("input", onInput);
    };
  }, [phase, typedText, targetText, isComposing, mode, wordOption, stopTimer, play, saveArcadeScore]);

  // ── render helpers ──
  const bestScore = arcadeScores[mode]?.[
    mode === GAME_MODES.TIME_ATTACK
      ? String(timeOption.seconds)
      : String(wordOption.count)
  ];

  const timerDisplay = mode === GAME_MODES.TIME_ATTACK
    ? formatTime(countdown)
    : formatTime(elapsed);

  const timerColor = mode === GAME_MODES.TIME_ATTACK && countdown <= 10
    ? "text-red-600 animate-pulse"
    : "text-gray-800";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-700 text-white px-8 py-4 shadow-lg flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-purple-200 hover:text-white transition"
          aria-label="Back to lessons"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400" /> Arcade Mode
        </h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — config */}
        <div className="w-72 bg-white border-r border-gray-200 p-6 overflow-y-auto flex flex-col gap-6">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Game Mode</h2>
            <div className="flex flex-col gap-3">
              <ModeCard
                icon="⏱️"
                title="Time Attack"
                description="Type as many words as you can before time runs out."
                active={mode === GAME_MODES.TIME_ATTACK}
                onClick={() => { setMode(GAME_MODES.TIME_ATTACK); setPhase("config"); }}
              />
              <ModeCard
                icon="🏃"
                title="Word Sprint"
                description="Race to type a set number of words as fast as possible."
                active={mode === GAME_MODES.WORD_SPRINT}
                onClick={() => { setMode(GAME_MODES.WORD_SPRINT); setPhase("config"); }}
              />
            </div>
          </div>

          {/* Options */}
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              {mode === GAME_MODES.TIME_ATTACK ? "Duration" : "Word Count"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {mode === GAME_MODES.TIME_ATTACK
                ? TIME_ATTACK_OPTIONS.map((o) => (
                    <OptionPill
                      key={o.seconds}
                      label={o.label}
                      active={timeOption.seconds === o.seconds}
                      onClick={() => { setTimeOption(o); setPhase("config"); }}
                    />
                  ))
                : WORD_SPRINT_OPTIONS.map((o) => (
                    <OptionPill
                      key={o.count}
                      label={o.label}
                      active={wordOption.count === o.count}
                      onClick={() => { setWordOption(o); setPhase("config"); }}
                    />
                  ))}
            </div>
          </div>

          {/* Best score for current config */}
          {bestScore && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-700 font-bold text-sm mb-2">
                <Trophy className="w-4 h-4" /> Personal Best
              </div>
              <div className="text-2xl font-bold text-gray-800">{bestScore.wpm} WPM</div>
              <div className="text-xs text-gray-500 mt-1">{bestScore.accuracy}% accuracy</div>
              {mode === GAME_MODES.WORD_SPRINT && (
                <div className="text-xs text-gray-500">{formatTime(bestScore.time)}</div>
              )}
            </div>
          )}
        </div>

        {/* Right panel — game area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Timer bar */}
          {phase === "playing" && (
            <div className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-gray-500" />
                  <span className={`text-2xl font-bold tabular-nums ${timerColor}`}>
                    {timerDisplay}
                  </span>
                </div>
                {mode === GAME_MODES.WORD_SPRINT && (
                  <div className="text-sm text-gray-500">
                    {typedText.trim().split(/\s+/).filter(Boolean).length} / {wordOption.count} words
                  </div>
                )}
                {mode === GAME_MODES.TIME_ATTACK && (
                  <div className="text-sm text-gray-500">
                    {typedText.trim().split(/\s+/).filter(Boolean).length} words typed
                  </div>
                )}
              </div>
              <Button variant="secondary" onClick={() => { stopTimer(); setPhase("config"); resetTyped(); }}>
                <RotateCcw className="w-4 h-4 inline mr-1" /> Quit
              </Button>
            </div>
          )}

          {/* Main area */}
          <div className="flex-1 overflow-y-auto p-8">            {phase === "config" && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">
                    {mode === GAME_MODES.TIME_ATTACK ? "⏱️" : "🏃"}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {mode === GAME_MODES.TIME_ATTACK ? "Time Attack" : "Word Sprint"}
                  </h2>
                  <p className="text-gray-500 mb-2">
                    {mode === GAME_MODES.TIME_ATTACK
                      ? `Type as many words as possible in ${timeOption.label}.`
                      : `Type ${wordOption.count} words as fast as you can.`}
                  </p>
                  <p className="text-sm text-gray-400 mb-8">
                    Random Amharic words will appear. Timer starts on your first keystroke.
                  </p>
                  <Button onClick={startGame}>Start Game</Button>
                </div>
              </div>
            )}

            {phase === "playing" && (
              <div className="max-w-4xl mx-auto">
                <div className="p-8 bg-white rounded-xl border-2 border-gray-200 min-h-[200px] flex items-start">
                  <GhostText text={targetText} typedText={typedText} />
                </div>
                <input
                  ref={inputRef}
                  id="arcade-input"
                  type="text"
                  className="mt-4 w-full px-4 py-3 text-2xl font-amharic border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  placeholder="Type here..."
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
            )}

            {phase === "results" && (
              <div className="h-full flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
                  <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">
                    {mode === GAME_MODES.TIME_ATTACK ? "⏱️ Time's Up!" : "🏁 Sprint Complete!"}
                  </h2>
                  <p className="text-center text-gray-400 text-sm mb-6">
                    {mode === GAME_MODES.TIME_ATTACK
                      ? `${timeOption.label} challenge`
                      : `${wordOption.count}-word sprint`}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <ScoreBadge label="WPM" value={finalWPM} />
                    <ScoreBadge label="Accuracy" value={`${finalAccuracy}%`} />
                    <ScoreBadge
                      label={mode === GAME_MODES.TIME_ATTACK ? "Words" : "Time"}
                      value={mode === GAME_MODES.TIME_ATTACK ? wordsCompleted : formatTime(elapsed)}
                    />
                  </div>

                  {/* Personal best indicator */}
                  {bestScore && finalWPM >= bestScore.wpm && (
                    <div className="mb-4 text-center text-yellow-600 font-semibold flex items-center justify-center gap-2">
                      <Trophy className="w-5 h-5" /> New Personal Best!
                    </div>
                  )}

                  <div className="flex gap-3 justify-center">
                    <Button onClick={startGame}>Play Again</Button>
                    <Button variant="secondary" onClick={() => setPhase("config")}>Change Mode</Button>
                    <Button variant="secondary" onClick={() => navigate("/")}>Back to Lessons</Button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ArcadePage;
