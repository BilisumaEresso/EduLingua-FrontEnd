import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Timer, RefreshCw, XCircle, CheckCircle2, Gamepad2 } from 'lucide-react';

// Mock Data
const vocabulary = {
  easy: [
    { word: 'Hello', correct: 'Jambo', options: ['Jambo', 'Asante', 'Kwaheri', 'Ndiyo'] },
    { word: 'Water', correct: 'Maji', options: ['Maziwa', 'Maji', 'Divai', 'Mkate'] },
    { word: 'Dog', correct: 'Mbwa', options: ['Paka', 'Mbwa', 'Ndege', 'Farasi'] },
    { word: 'House', correct: 'Nyumba', options: ['Gari', 'Tofaa', 'Nyumba', 'Kitabu'] },
    { word: 'Cat', correct: 'Paka', options: ['Ndege', 'Paka', 'Mbwa', 'Samaki'] },
  ],
  medium: [
    { word: 'Always', correct: 'Daima', options: ['Kamwe', 'Wakati mwingine', 'Daima', 'Mara nyingi'] },
    { word: 'To eat', correct: 'Kula', options: ['Kunywa', 'Kulala', 'Kukimbia', 'Kula'] },
    { word: 'Yesterday', correct: 'Jana', options: ['Kesho', 'Leo', 'Jana', 'Kamwe'] },
    { word: 'Window', correct: 'Dirisha', options: ['Mlango', 'Ukuta', 'Dirisha', 'Paa'] },
    { word: 'To speak', correct: 'Kusema', options: ['Kusema', 'Kusikiliza', 'Kutazama', 'Kuandika'] },
  ],
  hard: [
    { word: 'Nevertheless', correct: 'Walakini', options: ['Hata hivyo', 'Walakini', 'Bado', 'Ijapokuwa'] },
    { word: 'To overwhelm', correct: 'Kuzidi', options: ['Kutuliza', 'Kuzidi', 'Kusaidia', 'Kutulia'] },
    { word: 'Stubborn', correct: 'Kaidi', options: ['Mnyumbufu', 'Kaidi', 'Mpole', 'Mkarimu'] },
    { word: 'Thunderstorm', correct: 'Ngurumo', options: ['Mvua', 'Upepo', 'Ngurumo', 'Theluji'] },
    { word: 'Betrayal', correct: 'Usaliti', options: ['Uaminifu', 'Usaliti', 'Upendo', 'Chuki'] },
  ]
};

const PublicGame = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, end
  const [difficulty, setDifficulty] = useState('easy');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // Timer logic
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const startGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    // Shuffle questions
    const shuffled = [...vocabulary[selectedDifficulty]].sort(() => 0.5 - Math.random());
    // Shuffle options for each question
    const withShuffledOptions = shuffled.map(q => ({
      ...q,
      options: [...q.options].sort(() => 0.5 - Math.random())
    }));
    
    setQuestions(withShuffledOptions);
    setScore(0);
    setTimeLeft(selectedDifficulty === 'easy' ? 45 : selectedDifficulty === 'medium' ? 30 : 20);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setGameState('playing');
  };

  const handleAnswer = (option) => {
    if (selectedAnswer) return; // Prevent multiple clicks

    const correct = option === questions[currentQuestionIndex].correct;
    setSelectedAnswer(option);
    setIsCorrect(correct);

    if (correct) {
      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
      setScore(prev => prev + points);
    }

    // Move to next question or end game
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        endGame();
      }
    }, 1000); // 1 second delay to show right/wrong
  };

  const endGame = () => {
    setGameState('end');
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-2xl relative">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl"></div>

        <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[500px] flex flex-col">
          
          {/* Header (only shown during play or end) */}
          {gameState !== 'menu' && (
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                <Trophy className="h-6 w-6" />
                <span>Score: {score}</span>
              </div>
              <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}`}>
                <Timer className="h-6 w-6" />
                <span>00:{timeLeft.toString().padStart(2, '0')}</span>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col p-8">
            <AnimatePresence mode="wait">
              {/* MENU STATE */}
              {gameState === 'menu' && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
                >
                  <div>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 mb-6 shadow-sm border border-indigo-200 dark:border-indigo-800/50">
                      <Gamepad2 className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Translation Rush</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                      Translate as many words as you can before the time runs out. Choose your difficulty!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        onClick={() => startGame(level)}
                        className={`py-4 px-6 rounded-xl font-bold capitalize transition-all active:scale-95 border-2 ${
                          level === 'easy' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/40'
                            : level === 'medium'
                            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/40'
                            : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-900/40'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* PLAYING STATE */}
              {gameState === 'playing' && currentQuestion && (
                <motion.div
                  key={`question-${currentQuestionIndex}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col justify-between"
                >
                  <div className="text-center mb-10 mt-4">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                      Translate
                    </span>
                    <h3 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-2">
                      {currentQuestion.word}
                    </h3>
                    <p className="text-slate-500 mt-2">to Swahili</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentQuestion.options.map((option, idx) => {
                      let btnStyle = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-500 shadow-sm text-slate-700 dark:text-slate-200";
                      
                      if (selectedAnswer) {
                        if (option === currentQuestion.correct) {
                          btnStyle = "bg-emerald-500 border-emerald-600 text-white shadow-md scale-[1.02] z-10";
                        } else if (option === selectedAnswer) {
                          btnStyle = "bg-rose-500 border-rose-600 text-white opacity-90";
                        } else {
                          btnStyle = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={!!selectedAnswer}
                          onClick={() => handleAnswer(option)}
                          className={`relative p-6 rounded-2xl border-2 text-lg font-bold transition-all duration-200 ${btnStyle}`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option}</span>
                            {selectedAnswer && option === currentQuestion.correct && (
                              <CheckCircle2 className="h-6 w-6 text-white" />
                            )}
                            {selectedAnswer === option && option !== currentQuestion.correct && (
                              <XCircle className="h-6 w-6 text-white" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* END STATE */}
              {gameState === 'end' && (
                <motion.div
                  key="end"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
                >
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center animate-ping">
                      <div className="w-24 h-24 rounded-full bg-indigo-400/20"></div>
                    </div>
                    <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white shadow-xl mb-6">
                      <Trophy className="h-12 w-12" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Time's Up!</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      You scored <span className="font-bold text-indigo-600 dark:text-indigo-400 text-2xl mx-1">{score}</span> points on {difficulty} mode.
                    </p>
                  </div>

                  <div className="pt-8 w-full max-w-xs">
                    <button
                      onClick={() => setGameState('menu')}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95"
                    >
                      <RefreshCw className="h-5 w-5" />
                      Play Again
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Progress Bar for playing state */}
          {gameState === 'playing' && (
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(timeLeft / (difficulty === 'easy' ? 45 : difficulty === 'medium' ? 30 : 20)) * 100}%` }}
              ></div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PublicGame;
