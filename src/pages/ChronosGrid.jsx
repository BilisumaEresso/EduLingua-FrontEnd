import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ChevronLeft, Trophy, Info, Target, Layers, Zap, CheckCircle2 as CheckIcon, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { saveGameProgress } from '../services/game';

import chronosData from '../data/games/chronos/data.json';

// --- MOCK DATA SOURCE ---
const GAME_DATA = chronosData;

const ChronosGrid = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [availableTiles, setAvailableTiles] = useState([]);
  const [timelineSlots, setTimelineSlots] = useState(Array(16).fill(null));
  const [lockedSegments, setLockedSegments] = useState([false, false, false, false]);
  const [isGameWon, setIsGameWon] = useState(false);
  const [activeInfo, setActiveInfo] = useState(null);
  const [selectedTileId, setSelectedTileId] = useState(null);

  useEffect(() => {
    // Shuffle events for available tiles
    const shuffled = [...GAME_DATA.events].sort(() => Math.random() - 0.5);
    setAvailableTiles(shuffled);
  }, []);

  const checkSegment = (slots, segmentIndex) => {
    const startIndex = segmentIndex * 4;
    const segmentSlots = slots.slice(startIndex, startIndex + 4);
    
    if (segmentSlots.some(s => s === null)) return false;
    
    const expectedCategory = GAME_DATA.events[startIndex].category;
    const allSameCategory = segmentSlots.every(s => s.category === expectedCategory);
    if (!allSameCategory) return false;
    
    for (let i = 0; i < segmentSlots.length - 1; i++) {
      if (segmentSlots[i].year > segmentSlots[i+1].year) return false;
    }
    
    return true;
  };

  const handleTileSelect = (tileId) => {
    if (isGameWon) return;
    setSelectedTileId(selectedTileId === tileId ? null : tileId);
  };

  const handleSlotClick = (slotIndex) => {
    if (isGameWon || lockedSegments[Math.floor(slotIndex / 4)]) return;

    // If slot is occupied, return tile to available
    if (timelineSlots[slotIndex]) {
      const tileToReturn = timelineSlots[slotIndex];
      setTimelineSlots(prev => {
        const next = [...prev];
        next[slotIndex] = null;
        return next;
      });
      setAvailableTiles(prev => [...prev, tileToReturn]);
      return;
    }

    // If a tile is selected, place it
    if (selectedTileId) {
      const tile = availableTiles.find(t => t.id === selectedTileId);
      const newSlots = [...timelineSlots];
      newSlots[slotIndex] = tile;
      
      setTimelineSlots(newSlots);
      setAvailableTiles(prev => prev.filter(t => t.id !== selectedTileId));
      setSelectedTileId(null);

      // Check segment
      const segmentIndex = Math.floor(slotIndex / 4);
      if (checkSegment(newSlots, segmentIndex)) {
        setLockedSegments(prev => {
          const next = [...prev];
          next[segmentIndex] = true;
          return next;
        });
        toast.success(t('chronosGrid.toast.success'), {
          style: { background: '#050505', color: '#39FF14', border: '1px solid #39FF14' },
          icon: '💎'
        });
      } else {
        // If 4 are filled but wrong
        const startIndex = segmentIndex * 4;
        if (newSlots.slice(startIndex, startIndex + 4).every(s => s !== null)) {
          setTimeout(() => {
            const tilesToReturn = newSlots.slice(startIndex, startIndex + 4);
            setTimelineSlots(prev => {
              const next = [...prev];
              for (let i = startIndex; i < startIndex + 4; i++) next[i] = null;
              return next;
            });
            setAvailableTiles(prev => [...prev, ...tilesToReturn]);
            toast.error(t('chronosGrid.toast.error'), {
               style: { background: '#050505', color: '#FF3131', border: '1px solid #FF3131' }
            });
          }, 600);
        }
      }
    }
  };

  useEffect(() => {
    if (lockedSegments.length > 0 && lockedSegments.every(s => s === true)) {
      setIsGameWon(true);
      if (isAuthenticated) {
        saveGameProgress({
          gameType: 'chronos-grid',
          difficulty: 'medium', // Default for now
          levelIndex: 0,
          stars: 3,
          score: 1000
        }).catch(err => console.error("Failed to save Chronos progress", err));
      }
    }
  }, [lockedSegments, isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 overflow-x-hidden flex flex-col font-sans">
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-[#050505]/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              {t('chronosGrid.title')} <span className="text-[10px] bg-gradient-to-r from-cyan-500 to-blue-600 px-2 py-0.5 rounded text-white tracking-widest not-italic">V.1.0</span>
            </h1>
            <p className="text-[10px] text-cyan-500/50 uppercase tracking-[0.3em] font-black">{GAME_DATA.theme}</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">{t('chronosGrid.status.integrity')}</span>
            <div className="flex gap-1.5">
              {lockedSegments.map((locked, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 w-8 rounded-full transition-all duration-700 ${locked ? 'bg-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.5)]' : 'bg-white/5'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col lg:flex-row relative z-10">
        
        {/* Available Tiles (Left) */}
        <div className="w-full lg:w-[400px] p-8 border-r border-white/5 bg-black/20 backdrop-blur-sm flex flex-col gap-6 overflow-y-auto lg:max-h-[calc(100vh-89px)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-cyan-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('chronosGrid.status.fragments')}</span>
            </div>
            <span className="text-[10px] font-black text-slate-600 bg-white/5 px-2 py-1 rounded">{availableTiles.length} {t('chronosGrid.status.left')}</span>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <AnimatePresence>
              {availableTiles.map((tile) => (
                <motion.div
                  key={tile.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handleTileSelect(tile.id)}
                  className={`relative p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 group ${
                    selectedTileId === tile.id 
                      ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)]' 
                      : 'bg-[#121212] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black tracking-tight leading-tight group-hover:translate-x-1 transition-transform">{tile.text}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveInfo(tile); }}
                      className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                    >
                      <Info size={16} />
                    </button>
                  </div>
                  {selectedTileId === tile.id && (
                    <motion.div 
                      layoutId="selector"
                      className="absolute -left-1 top-1/4 bottom-1/4 w-1 bg-cyan-500 rounded-full"
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Timeline (Center) */}
        <div className="flex-1 flex flex-col items-center py-16 px-6 relative overflow-y-auto lg:max-h-[calc(100vh-89px)] scrollbar-hide">
          <div className="w-full max-w-xl relative">
            {/* The Vertical Axis Beam */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent transform -translate-x-1/2" />
            
            <div className="space-y-20 relative">
              {[0, 1, 2, 3].map((segmentIndex) => (
                <div key={segmentIndex} className="relative">
                  {/* Segment Label */}
                  <div className="flex items-center justify-center mb-8">
                    <div className="bg-[#050505] px-6 py-2 rounded-full border border-white/5 flex items-center gap-3">
                      <span className={`text-[10px] font-black tracking-[0.4em] uppercase ${lockedSegments[segmentIndex] ? 'text-[#39FF14]' : 'text-slate-600'}`}>
                        {t('chronosGrid.status.era')}_0{segmentIndex + 1}
                      </span>
                      {lockedSegments[segmentIndex] && <CheckCircle2 size={12} className="text-[#39FF14]" />}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 relative">
                    {[0, 1, 2, 3].map((subIdx) => {
                      const slotIdx = segmentIndex * 4 + subIdx;
                      const placedTile = timelineSlots[slotIdx];
                      const isLocked = lockedSegments[segmentIndex];
                      
                      return (
                        <div 
                          key={slotIdx}
                          onClick={() => handleSlotClick(slotIdx)}
                          className={`group relative h-24 rounded-[2rem] border-2 transition-all duration-500 flex items-center justify-center cursor-pointer ${
                            placedTile 
                              ? (isLocked 
                                  ? 'bg-[#39FF14]/5 border-[#39FF14] shadow-[0_0_40px_rgba(57,255,20,0.1)]' 
                                  : 'bg-white/5 border-white/20 border-solid')
                              : (selectedTileId 
                                  ? 'border-cyan-500/50 bg-cyan-500/5 border-dashed animate-pulse' 
                                  : 'border-white/5 hover:border-white/10 border-dashed')
                          }`}
                        >
                          {/* Slot Marker */}
                          <div className="absolute -left-16 lg:-left-20 flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-800 uppercase tabular-nums tracking-tighter">{t('chronosGrid.status.node')}</span>
                            <span className={`text-xl font-black tabular-nums tracking-tighter ${placedTile ? 'text-slate-600' : 'text-slate-900'}`}>
                              {String(slotIdx + 1).padStart(2, '0')}
                            </span>
                          </div>

                          {placedTile ? (
                            <motion.div 
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex items-center justify-between w-full px-8"
                            >
                              <div className="flex flex-col">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${isLocked ? 'text-[#39FF14]' : 'text-cyan-500'}`}>
                                    {isLocked ? `AD ${placedTile.year}` : t('chronosGrid.status.placed')}
                                  </span>
                                  {isLocked && <div className="w-1 h-1 rounded-full bg-[#39FF14] animate-ping" />}
                                </div>
                                <span className={`text-xl font-black tracking-tight ${isLocked ? 'text-white' : 'text-slate-200'}`}>{placedTile.text}</span>
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveInfo(placedTile); }}
                                className={`p-3 rounded-2xl transition-colors ${isLocked ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                              >
                                <Info size={20} />
                              </button>
                            </motion.div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <Target size={16} className={`transition-colors ${selectedTileId ? 'text-cyan-500' : 'text-slate-900'}`} />
                              <span className={`text-[8px] font-black uppercase tracking-[0.5em] transition-colors ${selectedTileId ? 'text-cyan-500' : 'text-slate-900'}`}>
                                {selectedTileId ? t('chronosGrid.status.target') : t('chronosGrid.status.awaiting')}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Info Panel Overlay */}
      <AnimatePresence>
        {activeInfo && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveInfo(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-[#080808] border-l border-white/10 z-[101] p-12 shadow-2xl flex flex-col"
            >
              <button 
                onClick={() => setActiveInfo(null)}
                className="self-start w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 transition-all mb-12"
              >
                <XCircle size={24} />
              </button>
              
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-4 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-2xl">
                  <span className="text-xl font-black text-cyan-400 tabular-nums">AD {activeInfo.year}</span>
                  <div className="w-px h-4 bg-cyan-500/20" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeInfo.category}</span>
                </div>
                
                <h2 className="text-6xl font-black tracking-tighter leading-[0.9] italic uppercase">{activeInfo.text}</h2>
                
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest block">{t('chronosGrid.info.title')}</span>
                  <p className="text-xl text-slate-400 leading-relaxed font-medium">{activeInfo.info}</p>
                </div>
                
                <div className="pt-12 grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-cyan-500/30 transition-colors">
                    <Zap size={20} className="text-cyan-500 mb-4" />
                    <span className="block text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">{t('chronosGrid.info.significance')}</span>
                    <span className="text-sm font-bold block">{t('chronosGrid.info.catalyst')}</span>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-cyan-500/30 transition-colors">
                    <Target size={20} className="text-cyan-500 mb-4" />
                    <span className="block text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">{t('chronosGrid.info.region')}</span>
                    <span className="text-sm font-bold block">{t('chronosGrid.info.coast')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Win Overlay */}
      <AnimatePresence>
        {isGameWon && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] bg-[#050505] flex items-center justify-center p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#39FF1415_0%,_transparent_70%)]" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="max-w-2xl w-full text-center space-y-12 relative"
            >
              <div className="relative inline-block">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-[#39FF14] rounded-full blur-[100px]"
                />
                <div className="relative bg-[#050505] w-40 h-40 rounded-[3rem] flex items-center justify-center border-4 border-[#39FF14] mx-auto shadow-[0_0_50px_rgba(57,255,20,0.3)]">
                  <Trophy size={80} className="text-[#39FF14]" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-8xl font-black tracking-tighter italic uppercase bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">{t('chronosGrid.won.title')}</h2>
                <p className="text-2xl text-slate-400 font-medium max-w-lg mx-auto">{t('chronosGrid.won.subtitle')}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-12">
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-white text-black h-20 rounded-3xl font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-4 text-sm"
                >
                  <RefreshCw size={24} className="text-black" /> {t('chronosGrid.won.reset')}
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-transparent border-2 border-white/10 text-white h-20 rounded-3xl font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all active:scale-95 text-sm"
                >
                  {t('chronosGrid.won.dashboard')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CheckCircle2 = ({ size, className }) => <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Gamepad2 size={size} className={className} /></motion.div>;
const XCircle = ({ size }) => <motion.div whileHover={{ rotate: 90 }}><Zap size={size} /></motion.div>;
const RefreshCw = ({ size, className }) => <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}><Gamepad2 size={size} className={className} /></motion.div>;

export default ChronosGrid;
