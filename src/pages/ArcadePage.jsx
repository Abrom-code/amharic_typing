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

// ─── word generators ─────────────────────────────────────────────────────────

/** Fisher-Yates shuffle — unbiased, truly random order every call */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * Build a word list of exactly `n` words by cycling through shuffled
 * copies of the pool — no two consecutive cycles are the same order.
 */
const buildWordList = (n) => {
  const result = [];
  while (result.length < n) {
    result.push(...shuffle(ARCADE_WORD_POOL));
  }
  return result.slice(0, n);
};

const pickWords = (n) => buildWordList(n).join(' ');

/** Time-attack needs ~200 words — fresh shuffle every game */
const generateTimeAttackText = () => buildWordList(200).join(' ');

// ─── small UI pieces ─────────────────────────────────────────────────────────

const ModeCard = ({ icon, title, description, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
      active
        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700"
    }`}
  >
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl">{icon}</span>
      <span className="font-bold text-gray-800 dark:text-gray-100 text-lg">{title}</span>
    </div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
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

const ScoreBadge = ({ label, value }) => (
  <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 text-center">
    <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{label}</div>
    <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</div>
  </div>
);

// ─── main component ───────────────────────────────────────────────────────────

export const ArcadePage = () => {
  const navigate = useNavigate();
  const { play } = useSound();
  const { arcadeScores, saveArcadeScore } = useProgress();

  // ── config ──
  const [mode, setMode] = useState(GAME_MODES.TIME_ATTACK);
  const [timeOption, setTimeOption] = useState(TIME_ATTACK_OPTIONS[1]); // 60s
  const [wordOption, setWordOption] = useState(WORD_SPRINT_OPTIONS[1]); // 20 words

  // ── game phase ──
  const [phase, setPhase] = useState("config"); // "config" | "playing" | "results"

  // ── typing display state (drives re-render) ──
  const [targetText, setTargetText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // ── result display state ──
  const [finalWPM, setFinalWPM] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(100);
  const [finalWords, setFinalWords] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  // ── refs for live values accessible inside closures without stale state ──
  const correctRef = useRef(0);
  const totalRef = useRef(0);
  const typedRef = useRef("");
  const elapsedRef = useRef(0);
  const countdownRef = useRef(0);
  const phaseRef = useRef("config");
  const targetRef = useRef("");
  const modeRef = useRef(mode);
  const timeOptionRef = useRef(timeOption);
  const wordOptionRef = useRef(wordOption);
  const isComposingRef = useRef(false);
  const inputRef = useRef(null);
  const intervalRef = useRef(null);

  // keep option refs in sync
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { timeOptionRef.current = timeOption; }, [timeOption]);
  useEffect(() => { wordOptionRef.current = wordOption; }, [wordOption]);

  // ── end game ─────────────────────────────────────────────────────────────
  const endGame = useCallback(() => {
    if (phaseRef.current === "results") return; // already ended
    phaseRef.current = "results";

    clearInterval(intervalRef.current);

    const cc = correctRef.current;
    const tc = totalRef.current;
    const el = elapsedRef.current;
    const cd = countdownRef.current;
    const tt = typedRef.current;
    const currentMode = modeRef.current;
    const tOpt = timeOptionRef.current;
    const wOpt = wordOptionRef.current;

    const timeUsed = currentMode === GAME_MODES.TIME_ATTACK
      ? tOpt.seconds - cd
      : el;

    const wpm = calculateWPM(cc, Math.max(timeUsed, 1));
    const acc = calculateAccuracy(cc, tc);
    const words = tt.trim().split(/\s+/).filter(Boolean).length;

    setFinalWPM(wpm);
    setFinalAccuracy(acc);
    setFinalWords(words);
    setFinalTime(el);
    setPhase("results");
    play("success");

    // persist best score
    const key = currentMode === GAME_MODES.TIME_ATTACK
      ? String(tOpt.seconds)
      : String(wOpt.count);

    const existing = (arcadeScores[currentMode] || {})[key];
    const better = !existing ||
      (currentMode === GAME_MODES.TIME_ATTACK ? wpm > existing.wpm : el < existing.time);

    setIsNewBest(better);

    if (currentMode === GAME_MODES.TIME_ATTACK) {
      saveArcadeScore(currentMode, key, { wpm, accuracy: acc, wordsTyped: words });
    } else {
      saveArcadeScore(currentMode, key, { time: el, accuracy: acc, wpm });
    }
  }, [play, arcadeScores, saveArcadeScore]);

  // ── start game ───────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    clearInterval(intervalRef.current);

    const currentMode = modeRef.current;
    const tOpt = timeOptionRef.current;
    const wOpt = wordOptionRef.current;

    const text = currentMode === GAME_MODES.TIME_ATTACK
      ? generateTimeAttackText()
      : pickWords(wOpt.count);

    // reset refs
    correctRef.current = 0;
    totalRef.current = 0;
    typedRef.current = "";
    elapsedRef.current = 0;
    countdownRef.current = currentMode === GAME_MODES.TIME_ATTACK ? tOpt.seconds : 0;
    phaseRef.current = "playing";
    targetRef.current = text;

    // reset display state
    setTargetText(text);
    setTypedText("");
    setCountdown(currentMode === GAME_MODES.TIME_ATTACK ? tOpt.seconds : 0);
    setElapsed(0);
    setFinalWPM(0);
    setFinalAccuracy(100);
    setFinalWords(0);
    setFinalTime(0);
    setIsNewBest(false);
    setPhase("playing");

    // clear input DOM value
    setTimeout(() => {
      const el = document.getElementById("arcade-input");
      if (el) { el.value = ""; el.focus(); }
    }, 50);
  }, []);

  // ── timer: starts when phase becomes "playing", first tick on keypress ──
  // We use a separate "timerStarted" ref so the interval only starts after the first key
  const timerStartedRef = useRef(false);

  // Clean up interval whenever phase changes away from playing
  useEffect(() => {
    if (phase !== "playing") {
      clearInterval(intervalRef.current);
      timerStartedRef.current = false;
    }
  }, [phase]);

  // ── input event handler — attached/detached when phase changes ───────────
  useEffect(() => {
    if (phase !== "playing") return;

    const el = document.getElementById("arcade-input");
    if (!el) return;

    const onCompositionStart = () => { isComposingRef.current = true; };
    const onCompositionEnd   = () => { isComposingRef.current = false; };

    const onInput = (e) => {
      if (phaseRef.current !== "playing") return;

      const input = e.target.value;
      const prev = typedRef.current;
      const target = targetRef.current;

      // Start the interval timer on the very first character
      if (input.length === 1 && prev.length === 0 && !timerStartedRef.current) {
        timerStartedRef.current = true;

        intervalRef.current = setInterval(() => {
          if (modeRef.current === GAME_MODES.TIME_ATTACK) {
            countdownRef.current -= 1;
            setCountdown(countdownRef.current);

            if (countdownRef.current <= 0) {
              clearInterval(intervalRef.current);
              endGame();
            }
          } else {
            elapsedRef.current += 1;
            setElapsed(elapsedRef.current);
          }
        }, 1000);
      }

      // Deletion — just update
      if (input.length < prev.length) {
        typedRef.current = input;
        setTypedText(input);
        return;
      }

      // Block typing past target
      if (input.length > target.length) {
        e.target.value = prev;
        return;
      }

      const newChar = input[input.length - 1];
      const expectedChar = target[input.length - 1];

      typedRef.current = input;
      setTypedText(input);

      if (!isComposingRef.current && input.length > prev.length) {
        totalRef.current += 1;
        if (newChar === expectedChar) {
          correctRef.current += 1;
        }
      }

      // Word Sprint completion
      if (
        modeRef.current === GAME_MODES.WORD_SPRINT &&
        input.length === target.length &&
        !isComposingRef.current
      ) {
        setTimeout(() => {
          if (document.getElementById("arcade-input")?.value.length === target.length) {
            endGame();
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
  }, [phase, endGame]);

  // ── derived display values ────────────────────────────────────────────────
  const bestScore = arcadeScores[mode]?.[
    mode === GAME_MODES.TIME_ATTACK ? String(timeOption.seconds) : String(wordOption.count)
  ];

  const timerDisplay = mode === GAME_MODES.TIME_ATTACK
    ? formatTime(countdown)
    : formatTime(elapsed);

  const timerColor =
    mode === GAME_MODES.TIME_ATTACK && countdown > 0 && countdown <= 10
      ? "text-red-600 animate-pulse"
      : "text-gray-800 dark:text-gray-100";

  const wordProgress = typedText.trim().split(/\s+/).filter(Boolean).length;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-700 text-white px-8 py-4 shadow-lg flex items-center gap-4 flex-shrink-0">
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
        {/* ── Left config panel ── */}
        <div className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto flex-shrink-0 flex flex-col gap-6">
          <div>
            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Game Mode</h2>
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

          <div>
            <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
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

          {bestScore && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-4">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-bold text-sm mb-2">
                <Trophy className="w-4 h-4" /> Personal Best
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{bestScore.wpm} WPM</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{bestScore.accuracy}% accuracy</div>
              {mode === GAME_MODES.WORD_SPRINT && (
                <div className="text-xs text-gray-500 dark:text-gray-400">{formatTime(bestScore.time)}</div>
              )}
            </div>
          )}
        </div>

        {/* ── Right game area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Timer bar — only during playing */}
          {phase === "playing" && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className={`text-2xl font-bold tabular-nums ${timerColor}`}>
                    {timerDisplay}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {mode === GAME_MODES.WORD_SPRINT
                    ? `${wordProgress} / ${wordOption.count} words`
                    : `${wordProgress} words typed`}
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  clearInterval(intervalRef.current);
                  phaseRef.current = "config";
                  setPhase("config");
                  setTypedText("");
                  typedRef.current = "";
                }}
              >
                <RotateCcw className="w-4 h-4 inline mr-1" /> Quit
              </Button>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-8">

            {/* Config screen */}
            {phase === "config" && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">
                    {mode === GAME_MODES.TIME_ATTACK ? "⏱️" : "🏃"}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    {mode === GAME_MODES.TIME_ATTACK ? "Time Attack" : "Word Sprint"}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">
                    {mode === GAME_MODES.TIME_ATTACK
                      ? `Type as many words as possible in ${timeOption.label}.`
                      : `Type ${wordOption.count} words as fast as you can.`}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
                    Random Amharic words will appear. Timer starts on your first keystroke.
                  </p>
                  <Button onClick={startGame}>Start Game</Button>
                </div>
              </div>
            )}

            {/* Playing screen */}
            {phase === "playing" && (
              <div className="max-w-4xl mx-auto flex flex-col gap-4">
                <div className="h-52 overflow-y-auto p-5 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                  <GhostText text={targetText} typedText={typedText} />
                </div>
                <input
                  ref={inputRef}
                  id="arcade-input"
                  type="text"
                  className="w-full px-4 py-3 text-2xl font-amharic border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Type here… timer starts on first keystroke"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>
            )}

            {/* Results screen */}
            {phase === "results" && (
              <div className="h-full flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full">
                  <h2 className="text-3xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100">
                    {mode === GAME_MODES.TIME_ATTACK ? "⏱️ Time's Up!" : "🏁 Sprint Complete!"}
                  </h2>
                  <p className="text-center text-gray-400 dark:text-gray-500 text-sm mb-6">
                    {mode === GAME_MODES.TIME_ATTACK
                      ? `${timeOption.label} challenge`
                      : `${wordOption.count}-word sprint`}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <ScoreBadge label="WPM" value={finalWPM} />
                    <ScoreBadge label="Accuracy" value={`${finalAccuracy}%`} />
                    <ScoreBadge
                      label={mode === GAME_MODES.TIME_ATTACK ? "Words" : "Time"}
                      value={mode === GAME_MODES.TIME_ATTACK ? finalWords : formatTime(finalTime)}
                    />
                  </div>

                  {isNewBest && (
                    <div className="mb-4 text-center text-yellow-600 font-semibold flex items-center justify-center gap-2">
                      <Trophy className="w-5 h-5" /> New Personal Best!
                    </div>
                  )}

                  <div className="flex gap-3 justify-center flex-wrap">
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
