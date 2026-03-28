import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Check, Volume2, ArrowRight, BookOpen, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllLessons } from '../services/lesson';
import { getAllSections } from '../services/section';
import { getAllLevels } from '../services/level';
import userProgressService from '../services/userProgress';

// Section renderer helpers
const SectionContent = ({ section, inputVal, setInputVal, isChecked }) => {
  const type = section.type?.toLowerCase();

  if (type === 'explanation' || type === 'text' || type === 'content') {
    return (
      <div className="flex flex-col items-center text-center justify-center flex-1 space-y-6">
        <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
          <BookOpen className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          {section.title || 'New Concept'}
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
          {section.content || section.text}
        </p>
        {section.mediaUrl && (
          <img src={section.mediaUrl} alt={section.title} className="max-w-sm rounded-2xl shadow-md" />
        )}
      </div>
    );
  }

  if (type === 'media' || type === 'image') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 space-y-6">
        <div className="w-20 h-20 bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 rounded-full flex items-center justify-center">
          <ImageIcon className="w-10 h-10" />
        </div>
        {section.mediaUrl
          ? <img src={section.mediaUrl} alt={section.title} className="max-w-md w-full rounded-2xl shadow-lg" />
          : <p className="text-slate-500">{section.content || section.text}</p>
        }
        {section.content && <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg text-center">{section.content}</p>}
      </div>
    );
  }

  if (type === 'translation') {
    return (
      <div className="flex flex-col flex-1 space-y-8 mt-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Translate this phrase</h2>
        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
          <p className="text-2xl font-medium text-indigo-900 dark:text-indigo-100">{section.question || section.content}</p>
        </div>
        <textarea
          autoFocus
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          disabled={isChecked}
          placeholder="Type your answer..."
          className="w-full h-32 p-4 text-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-indigo-500 focus:ring-0 dark:text-white resize-none transition-colors"
        />
      </div>
    );
  }

  if (type === 'listening' || type === 'audio') {
    return (
      <div className="flex flex-col flex-1 space-y-8 mt-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Listen carefully</h2>
        <div className="flex flex-col items-center justify-center p-12 space-y-8">
          <button
            onClick={() => section.mediaUrl && new Audio(section.mediaUrl).play()}
            className="w-24 h-24 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Volume2 className="w-10 h-10" />
          </button>
          {section.content && (
            <p className="text-xl font-medium text-slate-600 dark:text-slate-400 italic">"{section.content}"</p>
          )}
        </div>
      </div>
    );
  }

  if (type === 'multiple_choice' || type === 'quiz') {
    const options = section.options || [];
    return (
      <div className="flex flex-col flex-1 space-y-8 mt-10">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{section.question || section.content}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {options.map((option, idx) => {
            const optText = typeof option === 'string' ? option : option.text || option;
            return (
              <button
                key={idx}
                disabled={isChecked}
                onClick={() => setInputVal(optText)}
                className={`p-6 text-left rounded-2xl border-2 font-medium text-lg transition-all ${
                  inputVal === optText
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                {optText}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback: show content as text
  return (
    <div className="flex flex-col items-center text-center justify-center flex-1 space-y-6">
      <p className="text-xl text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
        {section.content || section.text || 'No content available.'}
      </p>
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // id here is levelId
        const [lessonsRes, levelRes] = await Promise.all([
          getAllLessons({ levelId: id }),
          getAllLevels({ _id: id }),
        ]);
        const fetchedLessons = lessonsRes?.data?.lessons || lessonsRes?.data || [];
        setLessons(fetchedLessons);

        const levels = levelRes?.data?.levels || levelRes?.data || [];
        setLevelInfo(levels[0] || null);

        // Fetch sections for the first lesson immediately
        if (fetchedLessons.length > 0) {
          const sectionsRes = await getAllSections({ lessonId: fetchedLessons[0]._id });
          setSections(sectionsRes?.data?.sections || sectionsRes?.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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

  const getAnswer = (section) => section?.answer || section?.correctAnswer || '';

  const handleCheck = () => {
    const type = currentSection?.type?.toLowerCase();
    if (!type || type === 'explanation' || type === 'text' || type === 'content' || type === 'media' || type === 'listening' || type === 'audio') {
      handleNext();
      return;
    }
    const answer = getAnswer(currentSection);
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

    // Finished current lesson — mark as complete and move to next
    if (currentLesson) {
      try {
        await userProgressService.markLessonCompleted({ lessonId: currentLesson._id });
      } catch (e) { /* non-critical */ }
    }

    if (currentLessonIdx < lessons.length - 1) {
      const nextLesson = lessons[currentLessonIdx + 1];
      setCurrentLessonIdx(prev => prev + 1);
      await loadSectionsForLesson(nextLesson);
    } else {
      // All lessons done → go to quiz
      navigate(`/quiz/${id}`);
    }
  };

  const isPassiveSection = () => {
    const type = currentSection?.type?.toLowerCase();
    return !type || ['explanation', 'text', 'content', 'media', 'image', 'listening', 'audio'].includes(type);
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
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
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
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-xs italic">{currentLesson?.objective || 'Complete the sections to progress.'}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
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
          </motion.div>
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
                  Correct: <span className="text-emerald-600 dark:text-emerald-400">{getAnswer(currentSection)}</span>
                </p>
              </div>
            )}
          </div>

          {currentSection && (
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
                <>Continue <ArrowRight className="w-4 h-4" /></>
              ) : 'Check'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
