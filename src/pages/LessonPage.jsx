import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Check, Volume2, ArrowRight, BookOpen, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { getAllLessons } from '../services/lesson';
import { getAllSections } from '../services/section';
import { getLevelById } from '../services/level';
import userProgressService from '../services/userProgress';

// Section renderer helpers
const ContentBlockRenderer = ({ block, inputVal, setInputVal, isChecked }) => {
  const { type, payload } = block;

  switch (type) {
    case 'explanation':
      return (
        <div className="space-y-4 py-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-xl text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            {payload?.text}
          </p>
        </div>
      );

    case 'translation':
      return (
        <div className="space-y-4 py-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
           <div className="space-y-1">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Native</span>
             <p className="text-lg font-bold text-slate-900 dark:text-white">{payload?.translations?.source}</p>
           </div>
           <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
           <div className="space-y-1">
             <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Learning</span>
             <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{payload?.translations?.target}</p>
           </div>
        </div>
      );

    case 'example':
      return (
        <div className="py-4 border-l-4 border-indigo-500 pl-6 my-4 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-r-2xl">
           <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2 tracking-widest">Example</p>
           <p className="text-lg text-slate-700 dark:text-slate-200">{payload?.text}</p>
        </div>
      );

    case 'exercise':
      return (
        <div className="space-y-6 py-8">
          <div className="p-6 bg-rose-50 dark:bg-rose-900/20 rounded-3xl border-2 border-rose-100 dark:border-rose-900/30">
            <h3 className="text-xl font-bold text-rose-900 dark:text-rose-100 mb-2">{payload?.question}</h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">Type the correct answer below</p>
          </div>
          <input
            autoFocus
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            disabled={isChecked}
            placeholder="Your answer..."
            className="w-full p-5 text-2xl font-bold bg-white dark:bg-slate-900 border-b-4 border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-0 dark:text-white transition-all outline-none"
          />
        </div>
      );

    case 'hint':
    case 'pronunciation':
      return (
        <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
          <div className="shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200 italic">{payload?.text || payload?.hint}</p>
        </div>
      );

    default:
      return null;
  }
};

const SectionContent = ({ section, inputVal, setInputVal, isChecked }) => {
  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
         <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{section.title}</h1>
         <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{section.objective}</p>
      </div>
      
      <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
        {section.contentBlocks?.map((block, idx) => (
          <div key={idx} className={idx > 0 ? 'pt-6' : ''}>
            <ContentBlockRenderer
              block={block}
              inputVal={inputVal}
              setInputVal={setInputVal}
              isChecked={isChecked}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const LessonPage = () => {
  const { id } = useParams(); // levelId
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [sections, setSections] = useState([]);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [levelInfo, setLevelInfo] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isSavingLesson, setIsSavingLesson] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // id here is levelId
        const [lessonsRes, levelRes] = await Promise.all([
          getAllLessons({ levelId: id }),
          getLevelById(id),
        ]);
        const fetchedLessons = lessonsRes?.data?.lessons || lessonsRes?.data || [];
        setLessons(fetchedLessons);

        const levelData = levelRes?.data?.level || levelRes?.level || levelRes?.data || null;
        setLevelInfo(levelData || null);

        // Fetch sections for the first lesson immediately
        if (fetchedLessons.length > 0) {
          const sectionsRes = await getAllSections({ lessonId: fetchedLessons[0]._id });
          setSections(sectionsRes?.data?.sections || sectionsRes?.data || []);
        }

        // Fetch user progress to check for completion
        if (levelData?.learning) {
          const progRes = await userProgressService.getProgress({ learningId: levelData.learning });
          const progData = progRes?.data?.progress || progRes?.data || progRes?.progress;
          setProgress(Array.isArray(progData) ? progData[0] : progData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getLearningId = () => levelInfo?.learning?._id || levelInfo?.learning

  const persistLessonStatus = async (lesson, lessonStatus) => {
    if (!lesson || !levelInfo?.learning) return
    const learningId = getLearningId()
    if (!learningId) return

    await userProgressService.markLessonCompleted({
      learningId,
      levelId: id,
      lessonId: lesson._id,
      status: lessonStatus,
    })

    // Refresh server state so phase/labels stay correct.
    const progRes = await userProgressService.getProgress({ learningId })
    const progData =
      progRes?.data?.progress || progRes?.data || progRes?.progress || progRes
    setProgress(Array.isArray(progData) ? progData[0] : progData)
  }

  // Load sections when lesson changes
  const loadSectionsForLesson = async (lesson) => {
    try {
      const sectionsRes = await getAllSections({ lessonId: lesson._id });
      setSections(sectionsRes?.data?.sections || sectionsRes?.data || []);
      setCurrentSectionIdx(0);
      setInputVal('');
      setIsChecked(false);
      setIsCorrect(null);
    } catch (e) {
      console.error(e);
    }
  };

  const currentLesson = lessons[currentLessonIdx];
  const currentSection = sections[currentSectionIdx];
  const totalSteps = sections.length;
  const progressPercent = totalSteps > 0 ? (currentSectionIdx / totalSteps) * 100 : 0;

  const handleCheck = () => {
    const exerciseBlock = currentSection?.contentBlocks?.find(b => b.type === 'exercise');
    
    if (!exerciseBlock) {
      handleNext();
      return;
    }

    const answer = exerciseBlock.payload?.answer || '';
    if (answer) {
      setIsCorrect(inputVal.trim().toLowerCase() === answer.toLowerCase());
      setIsChecked(true);
    } else {
      handleNext();
    }
  };

  const handleNext = async () => {
    setInputVal('');
    setIsChecked(false);
    setIsCorrect(null);

    if (currentSectionIdx < sections.length - 1) {
      setCurrentSectionIdx(prev => prev + 1);
      return;
    }

    // Finished current lesson — add to session state
    if (!currentLesson) return

    setIsSavingLesson(true)
    try {
      await persistLessonStatus(currentLesson, "done")
    } catch (e) {
      console.error("Failed to mark lesson done:", e)
    } finally {
      setIsSavingLesson(false)
    }

    if (currentLessonIdx < lessons.length - 1) {
      const nextLesson = lessons[currentLessonIdx + 1];
      setCurrentLessonIdx(prev => prev + 1);
      await loadSectionsForLesson(nextLesson);
    } else {
      // All lessons done → go to quiz (unless already in review).
      const levelEntry = progress?.levelsProgress?.find(
        (lp) =>
          (lp.levelId?._id || lp.levelId)?.toString?.() === id?.toString?.(),
      )
      if (levelEntry?.status === "review") navigate(`/learning/${getLearningId()}`)
      else navigate(`/quiz/${id}`)
    }
  };

  const handleSkipLesson = async () => {
    if (!currentLesson) return

    setIsSavingLesson(true)
    try {
      await persistLessonStatus(currentLesson, "skipped")
    } catch (e) {
      console.error("Failed to skip lesson:", e)
    } finally {
      setIsSavingLesson(false)
    }

    if (currentLessonIdx < lessons.length - 1) {
      const nextLesson = lessons[currentLessonIdx + 1];
      setCurrentLessonIdx(prev => prev + 1);
      await loadSectionsForLesson(nextLesson);
    } else {
      const levelEntry = progress?.levelsProgress?.find(
        (lp) =>
          (lp.levelId?._id || lp.levelId)?.toString?.() === id?.toString?.(),
      )
      if (levelEntry?.status === "review") navigate(`/learning/${getLearningId()}`)
      else navigate(`/quiz/${id}`)
    }
  }

  const isPassiveSection = () => {
    return !currentSection?.contentBlocks?.some(b => b.type === 'exercise');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span>Loading lesson...</span>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-500">
        <BookOpen className="w-12 h-12 text-slate-300" />
        <p className="text-lg font-medium">No lessons available for this level yet.</p>
        <button onClick={() => navigate(-1)} className="text-indigo-600 font-medium hover:underline">Go back</button>
      </div>
    );
  }

    const levelEntry = progress?.levelsProgress?.find(
      (lp) => (lp.levelId?._id || lp.levelId) === id,
    )
    const isLessonAlreadyDone = levelEntry?.lessonProgress?.some(
      (lp) =>
        (lp.lessonId?._id || lp.lessonId) === currentLesson?._id &&
        (lp.status === "done" || lp.status === "skipped"),
    );

    return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col">
      {/* Top Bar */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center gap-4 bg-white dark:bg-slate-950">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>{currentLesson?.title || 'Lesson'}</span>
            <span>Section {currentSectionIdx + 1} of {totalSteps}</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className={`h-full ${isLessonAlreadyDone ? 'bg-indigo-400' : 'bg-emerald-500'} transition-all duration-500 ease-out rounded-full`}
              style={{ width: `${progressPercent}%` }}
            />
            {isLessonAlreadyDone && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] font-black text-white uppercase tracking-tighter opacity-70">Reviewing</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lesson tabs (if multiple lessons) */}
      {lessons.length > 1 && (
        <div className="flex gap-2 px-4 sm:px-6 py-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
          {lessons.map((lesson, idx) => (
            <span
              key={lesson._id}
              className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                idx === currentLessonIdx
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                  : idx < currentLessonIdx
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {lesson.title || `Lesson ${idx + 1}`}
            </span>
          ))}
        </div>
      )}

      {/* Lesson Header (Objective/Topic) */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 py-3 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">Topic</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{currentLesson?.aiContext?.topic || 'General Learning'}</span>
            {isLessonAlreadyDone && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded flex items-center gap-1">
                <Check className="w-3 h-3" /> Already Done
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-xs italic">
              {isLessonAlreadyDone ? 'You are reviewing this lesson.' : (currentLesson?.objective || 'Complete the sections to progress.')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col">
        <AnimatePresence mode="wait">
          <Motion.div
            key={`${currentLessonIdx}-${currentSectionIdx}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            {currentSection ? (
              <SectionContent
                section={currentSection}
                inputVal={inputVal}
                setInputVal={setInputVal}
                isChecked={isChecked}
              />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-400">
                <BookOpen className="w-10 h-10 mb-3" />
                <p>No sections available.</p>
              </div>
            )}
          </Motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      <div className={`mt-auto border-t p-4 sm:p-6 transition-colors duration-300 ${
        isChecked && isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/50'
        : isChecked && !isCorrect ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/50'
        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
      }`}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            {isChecked && isCorrect && (
              <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 font-bold text-lg">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                Excellent! 🎉
              </div>
            )}
            {isChecked && !isCorrect && (
              <div className="flex flex-col gap-1 text-rose-700 dark:text-rose-400 font-bold text-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                    <X className="w-5 h-5" />
                  </div>
                  Incorrect
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 ml-11">
                  Correct: <span className="text-emerald-600 dark:text-emerald-400">{currentSection?.contentBlocks?.find(b => b.type === 'exercise')?.payload?.answer}</span>
                </p>
              </div>
            )}
          </div>

          {currentSection && (
            <div className="flex items-center gap-3">
              <button
                onClick={isChecked || isPassiveSection() ? handleNext : handleCheck}
                disabled={!isPassiveSection() && !inputVal && !isChecked}
              className={`px-8 py-3 rounded-full font-bold text-white shadow-sm transition-all flex items-center gap-2 ${
                isChecked && !isCorrect ? 'bg-rose-600 hover:bg-rose-700'
                : isChecked && isCorrect ? 'bg-emerald-600 hover:bg-emerald-700'
                : !isPassiveSection() && !inputVal ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
              }`}
              >
                {isChecked || isPassiveSection() ? (
                  <>
                    Continue <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  'Check'
                )}
              </button>

              <button
                onClick={handleSkipLesson}
                disabled={isSavingLesson}
                className="px-6 py-3 rounded-full font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Skip this lesson"
              >
                Skip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
