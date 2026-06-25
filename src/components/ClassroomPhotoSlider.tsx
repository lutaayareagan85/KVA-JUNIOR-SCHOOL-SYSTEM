import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon, 
  Calendar, 
  User, 
  Sparkles, 
  Share2, 
  Plus, 
  CheckCircle, 
  X, 
  Volume2,
  Bookmark,
  Send,
  Camera,
  Layers,
  Upload
} from 'lucide-react';

export interface PhotoSlide {
  id: string;
  title: string;
  category: string;
  image: string;
  date: string;
  desc: string;
  likes: number;
}

const INITIAL_SLIDES: PhotoSlide[] = [
  { 
    id: 's_1', 
    title: 'Tactile Motor Pre-Writing Activity', 
    category: 'KG1', 
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80', 
    date: 'June 21, 2026', 
    desc: 'Toddlers are coloring outlines of local Ugandan flora to develop fine hand muscles.',
    likes: 12
  },
  { 
    id: 's_2', 
    title: 'Nutritious Millet Porridge Breakfast', 
    category: 'Healthy Diet', 
    image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80', 
    date: 'June 21, 2026', 
    desc: 'Our morning vitamin-rich millets break prepared with clean borehole water. Every cup was finished today!',
    likes: 19
  },
  { 
    id: 's_3', 
    title: 'Creative Play & Sensory Building Blocks', 
    category: 'Outdoor Skills', 
    image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=800&q=80', 
    date: 'June 20, 2026', 
    desc: 'Promoting cognitive sharing, group balance, and problem-solving through soft geometric play blocks.',
    likes: 15
  },
  { 
    id: 's_4', 
    title: 'Supervised Rest & Infant Nap Block', 
    category: 'Health & Care', 
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80', 
    date: 'June 19, 2026', 
    desc: 'Quiet rest hours on sanitized soft beds, helping consolidate active early brain development.',
    likes: 8
  }
];

const PRELOADED_GALLERY = [
  { name: 'Singing & Language Circle', url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=80' },
  { name: 'Coloring Outdoors', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=500&q=80' },
  { name: 'Pre-Math counting blocks', url: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=500&q=80' }
];

const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export function ClassroomPhotoSlider() {
  const [slides, setSlides] = useState<PhotoSlide[]>(() => {
    const saved = localStorage.getItem('kva_dashboard_slides');
    return saved ? JSON.parse(saved) : INITIAL_SLIDES;
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Custom slide form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('KG1');
  const [newImageSelected, setNewImageSelected] = useState(PRELOADED_GALLERY[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  
  // Dynamic toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto cycle active slide
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, slides.length]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('kva_dashboard_slides', JSON.stringify(slides));
  }, [slides]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Dispatch / Share with parent portal group
  const handleBroadcast = (slide: PhotoSlide) => {
    // Read parent messages from localStorage to append this beautiful photo alert!
    const savedMsg = localStorage.getItem('kva_parent_messages');
    const msgs = savedMsg ? JSON.parse(savedMsg) : [];
    
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timestampStr = `${hours}:${minutes} ${ampm}`;

    const broadcastMsg = {
      id: `msg_broadcast_${Date.now()}`,
      pupilId: 'P001', // Send to primary pilot index
      sender: 'teacher',
      senderName: 'Teacher Grace (Kids Villa Academy)',
      text: `🌟 CLASSROOM LIVE UPDATE broadcasted: ${slide.title}\n"${slide.desc}"`,
      imageUrl: slide.image,
      timestamp: timestampStr,
      date: now.toISOString().split('T')[0],
      isRead: false
    };

    localStorage.setItem('kva_parent_messages', JSON.stringify([...msgs, broadcastMsg]));
    triggerToast(`✓ Shared "${slide.title}" photo directly into Parent Portal Desk inbox!`);
  };

  const handleAddSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      alert("Please fill in slides title name and custom notes description.");
      return;
    }

    const imgToUse = uploadedImageUrl 
      ? uploadedImageUrl 
      : (customImageUrl.trim() ? customImageUrl.trim() : newImageSelected);

    const newSlideObj: PhotoSlide = {
      id: `slide_${Date.now()}`,
      title: newTitle,
      category: newCategory,
      image: imgToUse,
      date: 'Today',
      desc: newDesc,
      likes: 0
    };

    const updatedSlides = [newSlideObj, ...slides];
    setSlides(updatedSlides);
    setActiveIndex(0);
    
    // reset form
    setNewTitle('');
    setNewDesc('');
    setCustomImageUrl('');
    setUploadedImageUrl(null);
    setIsAddOpen(false);

    triggerToast(`📸 Successfully added "${newSlideObj.title}" spotlight spotlight to home presentation board!`);
  };

  const currentSlide = slides[activeIndex] || slides[0];

  return (
    <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-xs relative overflow-hidden" id="dashboard-classroom-slider">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-sky-50/50">
        <div>
          <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest flex items-center gap-1.5 font-mono">
            <Camera className="w-3.5 h-3.5" />
            Spotlight Classroom Highlights
          </span>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight mt-0.5">
            Active KVA Classroom Day Slideshow
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black tracking-wider uppercase cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Spotlight Photo
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-semibold text-xs py-2 px-4 rounded-full shadow-lg z-50 flex items-center gap-1.5 border border-sky-500/20">
          <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
          {toastMessage}
        </div>
      )}

      {/* Slide Presentation Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Photo Stage display frame */}
        <div className="lg:col-span-7 relative h-[280px] sm:h-[340px] rounded-2xl overflow-hidden shadow-xs border border-sky-100 bg-stone-100 group">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide.id}
              src={currentSlide.image}
              alt={currentSlide.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>

          {/* Overlays top badge */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase">
              {currentSlide.category}
            </span>
            <span className="bg-sky-500/90 backdrop-blur-xs text-white text-[9px] font-bold px-2.5 py-1 rounded-full font-mono">
              {currentSlide.date}
            </span>
          </div>

          {/* Autoplay status indicator */}
          <div className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-xs text-white p-1 rounded-xl flex items-center gap-1 text-[9px] z-10">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="hover:scale-105 cursor-pointer p-0.5"
              title={isPlaying ? "Pause autoplay" : "Start autoplay"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-sky-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>

          {/* Change Photo from local disk option */}
          <div className="absolute bottom-3 left-3 z-10">
            <label className="bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-full cursor-pointer flex items-center gap-1.5 transition-all shadow-md select-none">
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Change Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const base64 = await resizeImage(file);
                      const updated = slides.map(s => s.id === currentSlide.id ? { ...s, image: base64 } : s);
                      setSlides(updated);
                      triggerToast("📸 Active slide photo changed successfully!");
                    } catch (err) {
                      console.error("Error reading or resizing image:", err);
                    }
                  }
                }}
              />
            </label>
          </div>

          {/* Navigation arrow buttons overlay */}
          <div className="absolute top-1/2 -translate-y-1/2 left-3 right-3 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handlePrev}
              className="w-9 h-9 rounded-full bg-white/95 text-slate-900 flex items-center justify-center cursor-pointer pointer-events-auto shadow-md hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-9 h-9 rounded-full bg-white/95 text-slate-900 flex items-center justify-center cursor-pointer pointer-events-auto shadow-md hover:bg-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Text descriptions Details & Quick Shares column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-2">
            <h4 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
              {currentSlide.title}
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed font-semibold">
              {currentSlide.desc}
            </p>
          </div>

          {/* Interactions metrics pane */}
          <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 space-y-3.5">
            <div className="flex items-center justify-between text-xs text-slate-800 font-bold">
              <span>NCDC Curriculum Area:</span>
              <span className="text-sky-600 bg-white border border-sky-100 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase">
                {currentSlide.category === 'Healthy Diet' ? 'Physical & Health Habits' : 'Pre-Reading & Creativity'}
              </span>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  const updated = [...slides];
                  updated[activeIndex].likes += 1;
                  setSlides(updated);
                  triggerToast(`🧡 Reacted and loved "${currentSlide.title}" classroom update!`);
                }}
                className="flex-1 bg-white hover:bg-stone-50 border border-stone-200 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-800 cursor-pointer"
              >
                ❤️ Loved ({currentSlide.likes})
              </button>

              <button
                onClick={() => handleBroadcast(currentSlide)}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                title="Send Photo card to simulated Parent Portal app feed"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-200" />
                Notify Parents
              </button>
            </div>
          </div>

          {/* Slides navigation Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full cursor-pointer transition-all duration-200 ${
                  activeIndex === idx ? 'w-6 bg-slate-900' : 'w-2 bg-stone-300 hover:bg-stone-400'
                }`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Add Spotlights modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-sky-100 shadow-xl relative animate-fadeInSmooth">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-stone-100 rounded-full"
            >
              <X className="w-5 h-5 text-stone-500" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Spotlight Classroom Update
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Add a new photograph card to the main slideshow reel of Kids Villa Academy home dashboard.
            </p>

            <form onSubmit={handleAddSlide} className="space-y-4">
              {/* Slide Title */}
              <div>
                <label className="block text-[9px] font-black text-slate-800 uppercase mb-1">Slide Title / Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clay modeling exercise"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-stone-50 p-2.5 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Category Class level */}
                <div>
                  <label className="block text-[9px] font-black text-slate-800 uppercase mb-1">Target Class</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-stone-50 p-2.5 border border-stone-200 rounded-xl text-xs"
                  >
                    <option value="KG1">KG1 (3-4 Yrs)</option>
                    <option value="KG2">KG2 (4-5 Yrs)</option>
                    <option value="KG3">KG3 (5-6 Yrs)</option>
                    <option value="Pre-Primary">Pre-Primary Area</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[9px] font-black text-slate-800 uppercase mb-1">Date tag</label>
                  <input
                    type="text"
                    required
                    value="June 21, 2026"
                    disabled
                    className="w-full bg-stone-100 p-2.5 border border-stone-200 rounded-xl text-xs text-stone-500 font-mono"
                  />
                </div>
              </div>

              {/* Choose preselected image or paste url or upload from disk */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-800 uppercase mb-1">Select Presets Image</label>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {PRELOADED_GALLERY.map(img => (
                      <button
                        key={img.url}
                        type="button"
                        onClick={() => {
                          setNewImageSelected(img.url);
                          setCustomImageUrl('');
                          setUploadedImageUrl(null);
                        }}
                        className={`h-14 rounded-lg overflow-hidden border-2 relative cursor-pointer ${
                          newImageSelected === img.url && !customImageUrl && !uploadedImageUrl ? 'border-sky-500 bg-sky-100' : 'border-stone-200'
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-0.5 opacity-80">
                          <span className="text-[7px] text-white font-extrabold text-center uppercase">{img.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <span className="text-[10px] text-stone-400 font-bold uppercase">URL:</span>
                    </div>
                    <input
                      type="url"
                      placeholder="Or paste high quality image Unsplash web link..."
                      value={customImageUrl}
                      onChange={(e) => {
                        setCustomImageUrl(e.target.value);
                        setUploadedImageUrl(null);
                      }}
                      className="w-full bg-stone-50 pl-10 pr-3 py-2 text-xs border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Import From Local Disk */}
                <div>
                  <label className="block text-[9px] font-black text-slate-800 uppercase mb-1">Or Import From Local Disk</label>
                  <div className="flex gap-3 items-center">
                    <label className="flex-1 border-2 border-dashed border-stone-200 hover:border-sky-400 bg-stone-50 hover:bg-sky-50/20 transition-all rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer text-center group">
                      <Upload className="w-5 h-5 text-stone-400 group-hover:text-sky-500 mb-1 animate-pulse" />
                      <span className="text-[10px] text-stone-600 font-bold group-hover:text-slate-800">
                        {uploadedImageUrl ? "Change chosen image..." : "Choose image file..."}
                      </span>
                      <span className="text-[8px] text-stone-400 font-medium">
                        PNG, JPG up to 5MB (Auto-compressed)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const base64 = await resizeImage(file);
                              setUploadedImageUrl(base64);
                              setCustomImageUrl('');
                            } catch (err) {
                              console.error("Error reading or resizing image:", err);
                            }
                          }
                        }}
                      />
                    </label>

                    {uploadedImageUrl && (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200 shadow-xs group bg-stone-50 shrink-0">
                        <img src={uploadedImageUrl} alt="Upload preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedImageUrl(null)}
                          className="absolute inset-0 bg-red-600/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-black uppercase p-1 text-center cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[9px] font-black text-slate-800 uppercase mb-1">Classroom Update / Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the learning happening in the image. Keep it parents-friendly..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-stone-50 p-2.5 border border-stone-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 text-xs font-black bg-sky-600 hover:bg-sky-700 text-white rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Confirm Spotlight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
