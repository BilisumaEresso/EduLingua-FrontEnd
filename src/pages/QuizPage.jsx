import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { X, Check, CheckCircle2, Trophy, ArrowRight, Loader2, BookOpen, RotateCcw } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import userProgressService from '../services/userProgress';
import { getLevelById } from '../services/level';

const QuizPage = () => {
  const { id } = useParams(); // levelId
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(null);
  const [levelInfo, setLevelInfo] = useState(null);
  const [learningId, setLearningId] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [quizMode, setQuizMode] = useState("quiz"); // quiz | review
  const [finalResult, setFinalResult] = useState(null); // { passed, score, passingScore }
  const [quizStartError, setQuizStartError] = useState("");

  useEffect(() => {
    const startQuizFlow = async () => {
      setLoading(true)
      setIsFinished(false)
      setFinalResult(null)
      setAttemptId(null)
      setSelectedAnswers({})
      setCurrentQIndex(0)
      setQuestions([])
      setQuizMode("quiz")
      setQuizStartError("")

      try {
        const levelRes = await getLevelById(id)
        const lvl = levelRes?.data?.level || levelRes?.level || levelRes?.data
        if (!lvl) throw new Error("Level not found")

        setLevelInfo(lvl)

        const lId = lvl.learning?._id || lvl.learning
        setLearningId(lId)

        if (!lId) throw new Error("Learning not found for level")

        const progRes = await userProgressService.getProgress({ learningId: lId })
        const progData =
          progRes?.data?.progress || progRes?.data || progRes?.progress || progRes
        const prog = Array.isArray(progData) ? progData[0] : progData
        setProgress(prog)

        let startRes = await userProgressService.quizStartAttempt({
          learningId: lId,
          levelId: id,
          questionCount: 10,
        })
        console.log(startRes)
        startRes = startRes?.data
        if (startRes?.mode === "review") {
          const levelEntry = prog?.levelsProgress?.find(
            (lp) =>
              (lp.levelId?._id || lp.levelId)?.toString?.() === id?.toString?.(),
          )
          const score =
            levelEntry?.bestQuizScore ?? levelEntry?.lastQuizScore ?? 0
          const passingScore = levelEntry?.minScore ?? lvl?.unlockCondition?.minScore ?? 70

          setQuiz({ title: lvl.title || "Level Quiz", _id: "level-quiz" })
          setQuizMode("review")
          setFinalResult({ passed: true, score, passingScore })
          setIsFinished(true)
          return
        }

        setQuizMode("quiz")
        setQuiz({ title: startRes?.quiz?.title || lvl.title || "Level Quiz", _id: "level-quiz" })
        setAttemptId(startRes?.attemptId || null)
        setQuestions(startRes?.questions || [])
        setFinalResult(null)
      } catch (e) {
        console.error("Failed to start quiz:", e)
        const apiMessage = e?.response?.data?.message || e?.response?.data?.data?.message
        setQuizStartError(apiMessage || "Unable to start quiz for this level yet.")
      } finally {
        setLoading(false)
      }
    }

    startQuizFlow()
  }, [id]);

  const question = questions[currentQIndex];
  const progressPercent = questions.length > 0 ? (currentQIndex / questions.length) * 100 : 0;

  const handleSelect = (option) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQIndex]: option }));
  };

  const handleNext = async () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1)
      return
    }

    // Last question -> submit on server
    setIsSaving(true)
    try {
      const learning = learningId
      const attempt = attemptId

      if (!learning || !attempt) throw new Error("Missing quiz attempt context")

      const answers = questions.map((q, idx) => ({
        questionId: q._id,
        answer: selectedAnswers[idx] ?? "",
      }))

      let submitRes = await userProgressService.quizSubmitAttempt({
        learningId: learning,
        levelId: id,
        attemptId: attempt,
        answers,
      })
      submitRes = submitRes?.data || submitRes;

      setFinalResult({
        passed: submitRes?.passed ?? false,
        score: submitRes?.score ?? 0,
        passingScore: submitRes?.passingScore ?? 70,
        results: submitRes?.results ?? [],
      })
      setIsFinished(true)
    } catch (e) {
      console.error("Failed to submit quiz:", e)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetry = async () => {
    if (!learningId) return
    setIsSaving(true)
    try {
      const startRes = await userProgressService.quizStartAttempt({
        learningId,
        levelId: id,
        questionCount: 10,
      })

      if (startRes?.mode === "review") {
        setQuizMode("review")
        setQuiz({ title: levelInfo?.title || "Level Quiz", _id: "level-quiz" })
        setIsFinished(true)
        const levelEntry = progress?.levelsProgress?.find(
          (lp) =>
            (lp.levelId?._id || lp.levelId)?.toString?.() === id?.toString?.(),
        )
        const score =
          levelEntry?.bestQuizScore ?? levelEntry?.lastQuizScore ?? 0
        const passingScore = levelEntry?.minScore ?? levelInfo?.unlockCondition?.minScore ?? 70
        setFinalResult({ passed: true, score, passingScore })
        return
      }

      setQuizMode("quiz")
      setIsFinished(false)
      setFinalResult(null)
      setAttemptId(startRes?.attemptId || null)
      setQuestions(startRes?.questions || [])
      setCurrentQIndex(0)
      setSelectedAnswers({})
    } catch (e) {
      console.error("Failed to retry quiz:", e)
    } finally {
      setIsSaving(false)
    }
  }

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span>Loading quiz...</span>
      </div>
    );
  }

  // ── Review mode (already passed) ────────────────────────────────
  if (quizMode === "review") {
    const score = finalResult?.score ?? 0
    const passingScore = finalResult?.passingScore ?? 70

    return (
      <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 max-w-md w-full text-center shadow-2xl border border-slate-100 dark:border-slate-800"
        >
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full animate-ping bg-emerald-400/20" />
            </div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full text-white shadow-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
              <Trophy className="h-12 w-12" />
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Quiz Passed
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Your best score:{" "}
            <strong className="text-emerald-600 dark:text-emerald-400">{score}%</strong> (passing{" "}
            {passingScore}%)
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate(`/lesson/${id}`)}
              className="w-full py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center gap-2"
            >
              Review Lessons <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/learning/${learningId}`)}
              className="w-full py-3.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Back to Level Path
            </button>
          </div>
        </Motion.div>
      </div>
    )
  }
console.log(quiz)
  // ── No quiz found ──────────────────────────────────────────────
  if (!quiz || questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-6 text-center p-4">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Quiz Available</h2>
          <p className="text-slate-500 dark:text-slate-400">
            {quizStartError || "There's no quiz for this level yet. Keep going!"}
          </p>
        </div>
        <button
          onClick={() => navigate('/tracks')}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold transition-colors"
        >
          Back to Tracks <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // ── Finished screen ────────────────────────────────────────────
  if (isFinished) {
    const score = finalResult?.score ?? 0
    const passed = finalResult?.passed ?? false

    return (
      <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <Motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 max-w-md w-full text-center shadow-2xl border border-slate-100 dark:border-slate-800"
        >
          {/* Score Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-24 h-24 rounded-full animate-ping ${passed ? 'bg-emerald-400/20' : 'bg-rose-400/20'}`} />
            </div>
            <div className={`relative inline-flex items-center justify-center w-24 h-24 rounded-full text-white shadow-xl bg-gradient-to-br ${
              passed ? 'from-emerald-400 to-emerald-600' : 'from-rose-400 to-rose-600'
            }`}>
              {passed ? <Trophy className="h-12 w-12" /> : <X className="h-12 w-12" />}
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            {passed ? 'Quiz Passed' : 'Needs Review'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            You scored <strong className={passed ? 'text-emerald-600' : 'text-rose-500'}>{score}%</strong> on "{quiz.title}"
          </p>

          {/* Score breakdown */}
          <div className="mb-8">
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${passed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1.5 px-0.5">
              <span>0%</span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">{score}%</span>
              <span>100%</span>
            </div>
          </div>

          {passed && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold mb-4">
              <span>XP Earned</span>
              <span>+{Math.round(score / 2)} XP</span>
            </div>
          )}

          {/* Results Details */}
          {finalResult?.results?.length > 0 && (
            <div className="mt-6 mb-8 text-left space-y-4 max-h-60 overflow-y-auto pr-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Question Summary:</h3>
              {finalResult.results.map((r, i) => (
                <div key={r.questionId || i} className={`p-4 rounded-xl border ${r.isCorrect ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-rose-50/50 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30'}`}>
                  <p className="font-medium text-slate-700 dark:text-slate-300 text-sm mb-2">{i + 1}. {r.questionText}</p>
                  <div className="text-xs space-y-1">
                    <p className={r.isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-slate-500 font-medium'}>
                      Your Answer: {r.selectedAnswer || '(no answer)'} {r.isCorrect && '✓'}
                    </p>
                    {!r.isCorrect && (
                      <p className="text-rose-600 dark:text-rose-400 font-semibold">
                        Correct Answer: {r.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => (passed ? navigate(`/learning/${learningId}`) : navigate(`/lesson/${id}`))}
              className="w-full py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
            {!passed && (
              <button
                onClick={handleRetry}
                className="w-full py-3.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Retry Quiz
              </button>
            )}
            <Link
              to="/tracks"
              className="block text-sm text-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors pt-1"
            >
              Back to all tracks
            </Link>
          </div>
        </Motion.div>
      </div>
    );
  }

  // ── Question UI ────────────────────────────────────────────────
  const options = question?.options || [];
  const selectedForCurrent = selectedAnswers[currentQIndex];

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Bar */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center gap-4 bg-white dark:bg-slate-950">
        <button
          onClick={() => navigate('/tracks')}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>{quiz.title}</span>
            <span>{currentQIndex + 1} / {questions.length}</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <Motion.div
            key={currentQIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-2xl mx-auto"
          >
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-3">
              Question {currentQIndex + 1}
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-8 leading-tight">
              {question.questionText || question.question || question.text}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {options.map((option, idx) => {
                const optText = typeof option === 'string' ? option : option.text || option;
                const isSelected = selectedForCurrent === optText;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(optText)}
                    className={`relative p-6 text-left rounded-2xl border-2 font-bold text-base transition-all active:scale-[0.98] ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{optText}</span>
                      {isSelected && <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </Motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      <div className="mt-auto border-t bg-white dark:bg-slate-950 p-4 sm:p-6 border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto flex justify-end">
          <button
            onClick={handleNext}
            disabled={!selectedForCurrent || isSaving}
            className={`px-8 py-3.5 rounded-full font-bold text-white shadow-sm transition-all flex items-center gap-2 ${
              !selectedForCurrent
                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed opacity-50'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            }`}
          >
            {currentQIndex === questions.length - 1 ? 'Submit Quiz' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
