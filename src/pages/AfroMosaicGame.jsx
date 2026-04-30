import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Info, Trophy, LayoutGrid, Archive, 
  CheckCircle2, Sparkles, HelpCircle, Zap, Timer, 
  RotateCcw, Play, BookOpen, AlertCircle, Star, Lock, 
  ChevronRight, LogIn, UserCheck
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { saveGameProgress, getGameProgress } from '../services/game';

import easyData from '../data/games/afromosaic/easy.json';
import mediumData from '../data/games/afromosaic/medium.json';
import hardData from '../data/games/afromosaic/hard.json';

// --- ETHIOPIAN FOCUSED DATASET ---
const GAME_DATABASE = {
  easy: easyData,
  medium: mediumData,
  hard: hardData
};

const AfroMosaicGame = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  
  // Game Configuration State
  const [gameState, setGameState] = useState('lobby'); // lobby, level_selector, instructions, playing, won
  const [difficulty, setDifficulty] = useState('easy');
  const [activeLevelIdx, setActiveLevelIdx] = useState(0);
  const [userProgress, setUserProgress] = useState([]); // [{ difficulty, levelIndex, stars }]

  // Gameplay State
  const [tiles, setTiles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [archive, setArchive] = useState([]);
  const [trials, setTrials] = useState(0);
  const [misses, setMisses] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // Fetch progress on mount
  useEffect(() => {
    if (isAuthenticated) {
      getGameProgress('afro-mosaic')
        .then(res => setUserProgress(res.data.progress))
        .catch(err => console.error("Failed to fetch progress", err));
    }
  }, [isAuthenticated]);

  // Timer Effect
  useEffect(() => {
    let timer;
    if (gameState === 'playing') {
      timer = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  const levelData = useMemo(() => {
    return GAME_DATABASE[difficulty][activeLevelIdx];
  }, [difficulty, activeLevelIdx]);

  // Initialize Game
  const initLevel = (lvl, idx) => {
    const config = GAME_DATABASE[lvl][idx];
    setTiles([...config.tiles].sort(() => Math.random() - 0.5));
    setArchive([]);
    setSelectedIds([]);
    setTrials(0);
    setMisses(0);
    setSeconds(0);
    setGameState('playing');
  };

  const handleTileClick = (tileId) => {
    if (gameState !== 'playing') return;

    // Deselection logic
    if (selectedIds.includes(tileId)) {
      setSelectedIds(prev => prev.filter(id => id !== tileId));
      return;
    }
    
    if (selectedIds.length < 4) {
      const nextSelected = [...selectedIds, tileId];
      setSelectedIds(nextSelected);
      if (nextSelected.length === 4) {
        checkMatch(nextSelected);
      }
    }
  };

  const checkMatch = (ids) => {
    setTrials(t => t + 1);
    const selectedTiles = levelData.tiles.filter(t => ids.includes(t.id));
    const firstCategory = selectedTiles[0].category;
    const isMatch = selectedTiles.every(t => t.category === firstCategory);

    if (isMatch) {
      setTimeout(() => {
        const newArchive = [...archive, { category: firstCategory, fragment: selectedTiles[0].fragment }];
        setArchive(newArchive);
        setTiles(prev => prev.filter(t => !ids.includes(t.id)));
        setSelectedIds([]);
        
        toast.success(`${firstCategory} ${t('mosaicGame.hints.success')}`, { icon: '✨' });

        if (newArchive.length === levelData.categories) {
          handleWin();
        }
      }, 400);
    } else {
      setMisses(m => m + 1);
      setTimeout(() => {
        setSelectedIds([]); // Auto-deselect on fail, but user can click to deselect before 4th
        if (misses >= 2) {
          toast(`${t('mosaicGame.hints.hint')} "${firstCategory}"`, { icon: '💡' });
        } else {
          toast.error(t('mosaicGame.hints.mismatch'));
        }
      }, 600);
    }
  };

  const calculateStars = () => {
    if (trials <= levelData.trialsTarget) return 3;
    if (trials <= levelData.trialsTarget + 4) return 2;
    return 1;
  };

  const handleWin = async () => {
    const stars = calculateStars();
    setGameState('won');

    if (isAuthenticated) {
      try {
        await saveGameProgress({
          gameType: 'afro-mosaic',
          difficulty,
          levelIndex: activeLevelIdx,
          stars,
          score: (levelData.categories * 100) - (trials * 5)
        });
        // Refresh progress
        const res = await getGameProgress('afro-mosaic');
        setUserProgress(res.data.progress);
      } catch (err) {
        toast.error("Failed to save progress");
      }
    }
  };

  const getStarsForLevel = (diff, idx) => {
    const prog = userProgress.find(p => p.difficulty === diff && p.levelIndex === idx);
    return prog ? prog.stars : 0;
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-hidden flex flex-col font-sans relative">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,_#1e1b4b_0%,_transparent_40%),radial-gradient(circle_at_80%_80%,_#312e81_0%,_transparent_40%)] pointer-events-none opacity-40" />

      {/* Header HUD */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => {
               if (gameState === 'playing') setGameState('level_selector');
               else if (gameState === 'level_selector') setGameState('lobby');
               else navigate(-1);
            }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              {t('mosaicGame.title')} <span className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded text-white tracking-widest not-italic">LV.{activeLevelIdx + 1}</span>
            </h1>
            {gameState === 'playing' && (
              <div className="flex items-center gap-4 mt-1">
                 <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                   <Timer size={10} className="text-indigo-400" /> {formatTime(seconds)}
                 </div>
                 <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                   <Zap size={10} className="text-amber-400" /> {t('mosaicGame.playing.trials')}: {trials}
                 </div>
              </div>
            )}
          </div>
        </div>

        {!isAuthenticated && (
          <button 
            onClick={() => navigate('/login', { state: { from: location } })}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600/20 transition-all"
          >
            <LogIn size={14} /> {t('mosaicGame.auth.loginToSave')}
          </button>
        )}

        <button 
          onClick={() => setIsArchiveOpen(true)}
          className="relative p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
        >
          <Archive size={24} className="text-indigo-400" />
          {archive.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full text-[10px] flex items-center justify-center font-black">
              {archive.length}
            </span>
          )}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          
          {/* 1. LOBBY: Difficulty Selector */}
          {gameState === 'lobby' && (
            <motion.div 
              key="lobby" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
              className="max-w-4xl w-full text-center space-y-12"
            >
              <div className="space-y-4">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30">
                  <Sparkles size={40} className="text-white" />
                </div>
                <h2 className="text-6xl font-black italic uppercase tracking-tighter">{t('mosaicGame.lobby.title')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['easy', 'medium', 'hard'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => { setDifficulty(lvl); setGameState('level_selector'); }}
                    className="group relative p-10 bg-[#121212] rounded-[3rem] border-2 border-white/5 hover:border-indigo-500/50 transition-all text-left overflow-hidden"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2 block">{t(`mosaicGame.lobby.${lvl}`)} {t('mosaicGame.lobby.protocol')}</span>
                    <h3 className="text-4xl font-black uppercase italic group-hover:translate-x-2 transition-transform">{t(`mosaicGame.lobby.${lvl}`)}</h3>
                    <div className="mt-4 flex gap-1">
                      {Array(lvl === 'easy' ? 1 : lvl === 'medium' ? 2 : 3).fill(0).map((_, i) => (
                        <Zap key={i} size={14} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* 2. LEVEL SELECTOR (PATH) */}
          {gameState === 'level_selector' && (
            <motion.div 
              key="levels" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="max-w-5xl w-full space-y-10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">{t('mosaicGame.selector.map')}</span>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter">{t(`mosaicGame.lobby.${difficulty}`)} {t('mosaicGame.selector.path')}</h2>
                </div>
                <button onClick={() => setGameState('lobby')} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white">{t('mosaicGame.selector.changeDifficulty')}</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {GAME_DATABASE[difficulty].map((lvl, idx) => {
                  const stars = getStarsForLevel(difficulty, idx);
                  const isUnlocked = idx === 0 || getStarsForLevel(difficulty, idx - 1) > 0;

                  return (
                    <button
                      key={idx}
                      disabled={!isUnlocked}
                      onClick={() => { setActiveLevelIdx(idx); setGameState('instructions'); }}
                      className={`relative p-8 rounded-[2.5rem] border-2 text-left transition-all ${
                        isUnlocked 
                          ? 'bg-[#121212] border-white/5 hover:border-indigo-500/50 group shadow-lg' 
                          : 'bg-black/40 border-white/5 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-3xl font-black italic text-white/20 group-hover:text-indigo-500 transition-colors">0{idx + 1}</span>
                        {!isUnlocked && <Lock size={20} className="text-slate-600" />}
                        {isUnlocked && (
                          <div className="flex gap-1">
                            {[1, 2, 3].map(s => (
                              <Star key={s} size={14} className={s <= stars ? "text-amber-400 fill-amber-400" : "text-white/10"} />
                            ))}
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tighter leading-tight mb-2">{lvl.theme}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{lvl.categories} {t('mosaicGame.selector.categories')}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 3. INSTRUCTIONS */}
          {gameState === 'instructions' && (
            <motion.div 
              key="inst" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl w-full bg-[#0d0d0d] rounded-[3rem] border border-white/5 p-12 space-y-10"
            >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400"><BookOpen size={24} /></div>
                 <h2 className="text-3xl font-black uppercase italic tracking-tight">{t('mosaicGame.instructions.title')}</h2>
              </div>
              <div className="space-y-6 text-slate-400 font-medium">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-[10px] flex items-center justify-center font-black text-white shrink-0 mt-1">01</div>
                  <p>{t('mosaicGame.instructions.step1')}</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-[10px] flex items-center justify-center font-black text-white shrink-0 mt-1">02</div>
                  <p>{t('mosaicGame.instructions.step2')}</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-[10px] flex items-center justify-center font-black text-white shrink-0 mt-1">03</div>
                  <p>{t('mosaicGame.instructions.step3')}</p>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setGameState('level_selector')} className="flex-1 h-16 rounded-2xl border border-white/10 text-sm font-black uppercase hover:bg-white/5">{t('mosaicGame.instructions.back')}</button>
                <button onClick={() => initLevel(difficulty, activeLevelIdx)} className="flex-[2] h-16 rounded-2xl bg-indigo-600 text-white text-sm font-black uppercase hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2">
                  <Play size={18} /> {t('mosaicGame.instructions.start')}
                </button>
              </div>
            </motion.div>
          )}

          {/* 4. PLAYING */}
          {gameState === 'playing' && (
            <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl flex flex-col items-center">
              <div className={`grid gap-4 w-full ${difficulty === 'easy' ? 'max-w-md grid-cols-2' : 'max-w-3xl grid-cols-4'}`}>
                <AnimatePresence>
                  {tiles.map((tile) => (
                    <motion.div
                      key={tile.id} layout initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                      onClick={() => handleTileClick(tile.id)}
                      className={`relative aspect-square flex items-center justify-center text-center p-4 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 ${
                        selectedIds.includes(tile.id)
                          ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_40px_rgba(79,70,229,0.4)] z-10 scale-105'
                          : 'bg-[#121212] border-white/5 hover:border-indigo-500/30'
                      }`}
                    >
                      <span className={`text-[10px] md:text-xs font-black uppercase tracking-tighter leading-none ${selectedIds.includes(tile.id) ? 'text-white' : 'text-slate-400'}`}>
                        {tile.text}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="mt-12 flex gap-3">
                {Array(levelData.categories).fill(0).map((_, i) => (
                  <div key={i} className={`h-2 w-10 rounded-full transition-all duration-700 ${archive.length > i ? 'bg-[#39FF14] shadow-[0_0_15px_#39FF14]' : 'bg-white/5'}`} />
                ))}
              </div>
            </motion.div>
          )}

          {/* 5. WON */}
          {gameState === 'won' && (
            <motion.div key="won" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full text-center space-y-10">
              <div className="relative inline-block">
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-[#39FF14] rounded-full blur-[80px]" />
                <div className="relative w-28 h-28 bg-[#050505] rounded-3xl border-4 border-[#39FF14] flex items-center justify-center shadow-2xl mx-auto">
                  <Trophy size={48} className="text-[#39FF14]" />
                </div>
              </div>
              <div className="flex justify-center gap-3">
                 {[1, 2, 3].map(s => (
                   <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + (s * 0.2) }}>
                     <Star size={40} className={s <= calculateStars() ? "text-amber-400 fill-amber-400" : "text-white/10"} />
                   </motion.div>
                 ))}
              </div>
              <div className="space-y-4">
                <h2 className="text-6xl font-black italic uppercase tracking-tighter">{t('mosaicGame.won.title')}</h2>
                <p className="text-xl text-slate-400 font-medium italic">"{levelData.solution_reveal}"</p>
              </div>
              <div className="flex gap-4 pt-10">
                <button onClick={() => setGameState('level_selector')} className="flex-1 h-16 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-slate-200">{t('mosaicGame.won.continue')}</button>
                <button onClick={() => navigate('/dashboard')} className="flex-1 h-16 rounded-2xl border-2 border-white/10 font-black uppercase tracking-widest">{t('mosaicGame.won.dashboard')}</button>
              </div>
              {!isAuthenticated && (
                <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest animate-pulse flex items-center justify-center gap-2">
                   <AlertCircle size={12} /> {t('mosaicGame.won.loginSave')}
                </p>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Archive Drawer Overlay */}
      <AnimatePresence>
        {isArchiveOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsArchiveOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[450px] bg-[#080808] border-l border-white/10 z-[101] p-12 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <Archive size={24} className="text-indigo-400" /><h2 className="text-2xl font-black uppercase tracking-widest italic">{t('mosaicGame.archive.title')}</h2>
                </div>
                <button onClick={() => setIsArchiveOpen(false)} className="p-3 hover:bg-white/5 rounded-2xl"><ChevronRight /></button>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto scrollbar-hide">
                {archive.map((item, idx) => (
                  <div key={idx} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 block mb-4">{item.category}</span>
                    <p className="text-lg font-medium text-slate-300 leading-relaxed italic">"{item.fragment}"</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AfroMosaicGame;
