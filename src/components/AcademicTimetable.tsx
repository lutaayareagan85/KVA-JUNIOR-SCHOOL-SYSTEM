import React, { useState } from 'react';
import { Calendar, Clock, AlertTriangle, Play, BookOpen, Plus, Sparkles } from 'lucide-react';
import { NurseryClass } from '../types';

interface Lesson {
  id: string;
  className: NurseryClass;
  subjectName: string;
  teacher: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  timeSlot: '08:30 AM - 09:30 AM' | '09:30 AM - 10:30 AM' | '11:00 AM - 12:00 PM';
  room: 'Assembly Hall' | 'Block A Room 1' | 'Garden Tent';
}

const INITIAL_LESSONS: Lesson[] = [
  { id: 'L1', className: 'KG1', subjectName: 'Pre-Maths (Classification)', teacher: 'Tr. Agnes', day: 'Monday', timeSlot: '08:30 AM - 09:30 AM', room: 'Block A Room 1' },
  { id: 'L2', className: 'KG1', subjectName: 'Phonics & Speech Sounds', teacher: 'Tr. Martha', day: 'Tuesday', timeSlot: '09:30 AM - 10:30 AM', room: 'Block A Room 1' },
  { id: 'L3', className: 'KG2', subjectName: 'Pre-Maths (Counting blocks)', teacher: 'Tr. Martha', day: 'Monday', timeSlot: '08:30 AM - 09:30 AM', room: 'Garden Tent' },
  { id: 'L4', className: 'KG3', subjectName: 'Luganda Folk Songs & Play', teacher: 'Tr. Florence', day: 'Wednesday', timeSlot: '11:00 AM - 12:00 PM', room: 'Assembly Hall' },
];

export function AcademicTimetable() {
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [selectedClassFilter, setSelectedClassFilter] = useState<NurseryClass | 'All'>('All');
  
  // Create New Lesson state
  const [newSubject, setNewSubject] = useState('Theme Play & Craft');
  const [newClass, setNewClass] = useState<NurseryClass>('KG1');
  const [newTeacher, setNewTeacher] = useState('Tr. Martha');
  const [newDay, setNewDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [newSlot, setNewSlot] = useState<'08:30 AM - 09:30 AM' | '09:30 AM - 10:30 AM' | '11:00 AM - 12:00 PM'>('08:30 AM - 09:30 AM');
  const [newRoom, setNewRoom] = useState<'Assembly Hall' | 'Block A Room 1' | 'Garden Tent'>('Block A Room 1');
  const [showAddForm, setShowAddForm] = useState(false);

  // Scheme of work objectives mock state
  const [schemesOfWork, setSchemesOfWork] = useState([
    { subject: 'Language & Letter Sounds', objective: 'To identify vowel sounds (a,e,i,o,u) through play-based sand tracing.', resources: 'Sand trays, sound flashcards, clay modelling', durationWeeks: 4 },
    { subject: 'Mathematical Play', objective: 'Develop understanding of size groups: Small, Medium, and Large through block sharing.', resources: 'Multi-colored geometric plastic cubes', durationWeeks: 3 },
    { subject: 'Creative Drawing & Clay Work', objective: 'To model familiar kitchen utensils (bowls, wooden spoons) utilizing local clay.', resources: 'Pottery clay, swamp fibers, water bowls', durationWeeks: 2 }
  ]);

  // Conflict Detection: check if any teacher is scheduled for two different lessons at the same Day & Time
  const findScheduleConflicts = (): string[] => {
    const list: string[] = [];
    for (let i = 0; i < lessons.length; i++) {
      for (let j = i + 1; j < lessons.length; j++) {
        const a = lessons[i];
        const b = lessons[j];
        if (a.day === b.day && a.timeSlot === b.timeSlot) {
          // Check Teacher conflict
          if (a.teacher === b.teacher) {
            list.push(`⚠️ Conflict found: Teacher "${a.teacher}" is assigned in multiple rooms ("${a.room}" & "${b.room}") on ${a.day}s at ${a.timeSlot}.`);
          }
          // Check Room conflict
          if (a.room === b.room) {
            list.push(`⚠️ Conflict found: Room "${a.room}" is double-booked for both "${a.subjectName}" and "${b.subjectName}" on ${a.day}s at ${a.timeSlot}.`);
          }
        }
      }
    }
    return list;
  };

  const conflicts = findScheduleConflicts();

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    const lessonItem: Lesson = {
      id: `L-${Date.now()}`,
      className: newClass,
      subjectName: newSubject,
      teacher: newTeacher,
      day: newDay,
      timeSlot: newSlot,
      room: newRoom
    };
    setLessons([...lessons, lessonItem]);
    setShowAddForm(false);
  };

  const handleDeleteLesson = (id: string) => {
    setLessons(lessons.filter(l => l.id !== id));
  };

  const filteredLessons = lessons.filter(l => selectedClassFilter === 'All' || l.className === selectedClassFilter);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC]">
        <h3 className="font-extrabold text-[#5A3E2B] text-base flex items-center gap-1.5">
          <Calendar className="w-5 h-5 text-[#6B8E23]" /> Curriculums Schemes & Smart Conflict TIMETABLE
        </h3>
        <p className="text-xs text-[#7D6B5D] leading-relaxed mt-1">
          Generate timetables for morning streams, register weekly objectives and prevent room resource double-booking with our real-time automatic conflict detection logic.
        </p>
      </div>

      {/* Conflict Board */}
      {conflicts.length > 0 && (
        <div className="bg-[#F9ECE4] p-4 rounded-2xl border-2 border-[#8C5A3C] space-y-2 animate-pulse">
          <h4 className="text-xs font-black text-[#5A3E2B] flex items-center gap-1.5 uppercase">
            <AlertTriangle className="w-4 h-4 text-[#8C5A3C]" /> Resource Collision Alarm Detected
          </h4>
          <div className="space-y-1">
            {conflicts.map((conf, index) => (
              <p key={index} className="text-xs text-[#3D2B1F] font-semibold">{conf}</p>
            ))}
          </div>
          <p className="text-[10px] text-[#7D6B5D] italic">* Resolve conflicts by rescheduling days, times slots, or assigning alternative staff.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Timetable display */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center pb-2.5 border-b border-[#F2EDE4]">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#7D6B5D]">Operational Weekly Timetable Grid</h4>
            
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-[#6B8E23] hover:bg-[#58751d] text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              + Create Stream Slot
            </button>
          </div>

          {/* Quick filter block */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            {(['All', 'KG1', 'KG2', 'KG3', 'Primary One', 'Primary Two', 'Primary Three', 'Primary Four', 'Primary Five', 'Primary Six', 'Primary Seven'] as const).map((cl) => (
              <button
                key={cl}
                onClick={() => setSelectedClassFilter(cl)}
                className={`text-[9px] py-1 px-2.5 rounded-full font-bold border transition-all cursor-pointer ${
                  selectedClassFilter === cl
                    ? 'bg-[#6B8E23] text-white border-[#6B8E23]'
                    : 'bg-white text-[#7D6B5D] border-[#E0D8CC] hover:bg-[#F2EDE4]'
                }`}
              >
                {cl === 'All' ? 'All Classes' : cl.replace('Primary ', 'P.')}
              </button>
            ))}
          </div>

          {/* Add form toggled representation */}
          {showAddForm && (
            <form onSubmit={handleCreateLesson} className="p-4 bg-[#F2EDE4]/30 rounded-2xl border border-[#E0D8CC]/80 space-y-3.5 animate-fadeIn">
              <span className="text-[10px] font-bold text-[#8C5A3C] uppercase block mb-1">New Stream Schedule Options</span>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Lesson Subject</label>
                  <input 
                    type="text" 
                    required 
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full p-2 bg-white rounded border border-[#E0D8CC]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Allocated Stream</label>
                  <select 
                    value={newClass} 
                    onChange={(e) => setNewClass(e.target.value as any)}
                    className="w-full p-2 bg-white rounded border border-[#E0D8CC]"
                  >
                    <option value="KG1">KG1</option>
                    <option value="KG2">KG2</option>
                    <option value="KG3">KG3</option>
                    <option value="Primary One">Primary One (P.1)</option>
                    <option value="Primary Two">Primary Two (P.2)</option>
                    <option value="Primary Three">Primary Three (P.3)</option>
                    <option value="Primary Four">Primary Four (P.4)</option>
                    <option value="Primary Five">Primary Five (P.5)</option>
                    <option value="Primary Six">Primary Six (P.6)</option>
                    <option value="Primary Seven">Primary Seven (P.7)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Assigned Caregiver</label>
                  <select
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    className="w-full p-2 bg-white rounded border border-[#E0D8CC]"
                  >
                    <option value="Tr. Martha">Tr. Martha</option>
                    <option value="Tr. Florence">Tr. Florence</option>
                    <option value="Tr. Patience">Tr. Patience</option>
                    <option value="Tr. Agnes">Tr. Agnes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Assigned Room</label>
                  <select
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value as any)}
                    className="w-full p-2 bg-white rounded border border-[#E0D8CC]"
                  >
                    <option value="Block A Room 1">Block A Room 1</option>
                    <option value="Garden Tent">Garden Tent</option>
                    <option value="Assembly Hall">Assembly Hall</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Scheduled Day</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as any)}
                    className="w-full p-2 bg-white rounded border border-[#E0D8CC]"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Time Recess Slot</label>
                  <select
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value as any)}
                    className="w-full p-2 bg-white rounded border border-[#E0D8CC]"
                  >
                    <option value="08:30 AM - 09:30 AM">08:30 AM - 09:30 AM</option>
                    <option value="09:30 AM - 10:30 AM">09:30 AM - 10:30 AM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1 bg-white border border-[#E0D8CC] text-xs font-semibold rounded-lg text-[#7D6B5D]"
                >
                  Dismiss
                </button>
                <button 
                  type="submit" 
                  className="px-4.5 py-1 bg-[#6B8E23] text-white text-xs font-extrabold rounded-lg hover:bg-[#58751d]"
                >
                  Add into system
                </button>
              </div>
            </form>
          )}

          {/* Lessons list display cards */}
          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
            {filteredLessons.length === 0 ? (
              <p className="text-xs text-[#7D6B5D] py-8 text-center italic">No lessons scheduled under the given filter.</p>
            ) : (
              filteredLessons.map(lesson => (
                <div key={lesson.id} className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#E0D8CC]/70 flex justify-between items-center transition-all hover:bg-white group">
                  <div className="space-y-1">
                    <span className="text-[9px] bg-[#E8F1D7] text-[#6B8E23] px-2 py-0.5 rounded-full font-bold">
                      {lesson.className}
                    </span>
                    <h5 className="font-extrabold text-sm text-[#3D2B1F]">{lesson.subjectName}</h5>
                    <div className="flex gap-2.5 text-[10px] text-[#7D6B5D] font-medium">
                      <span>Carer: <strong>{lesson.teacher}</strong></span>
                      <span>•</span>
                      <span>Room: <strong>{lesson.room}</strong></span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div className="space-y-1">
                      <span className="block text-xs font-black text-[#5A3E2B]">{lesson.day}</span>
                      <span className="block text-[10px] font-mono text-[#7D6B5D]">{lesson.timeSlot}</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="text-[#8C5A3C] text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right Side: Schemes of Work / learning objectives */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E0D8CC] p-6 space-y-4">
          <div className="flex items-center gap-1.5 text-[#8C5A3C]">
            <BookOpen className="w-5 h-5 text-[#8C5A3C]" />
            <h4 className="font-extrabold text-xs uppercase tracking-wider">NCDC Lesson Schemes of Work</h4>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {schemesOfWork.map((sch, idx) => (
              <div key={idx} className="p-3.5 bg-[#FDFBF7] rounded-2xl border border-[#E0D8CC]/75 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-[#3D2B1F]">{sch.subject}</span>
                  <span className="text-[#6B8E23] font-mono">{sch.durationWeeks} Weeks Unit</span>
                </div>
                <p className="text-[#7D6B5D] font-semibold">Objective: <span className="font-normal text-[#3D2B1F]">{sch.objective}</span></p>
                <div className="bg-[#F2EDE4]/30 p-2 rounded-lg border border-[#E0D8CC]/50 mt-1">
                  <span className="text-[9px] font-bold text-[#8C5A3C] uppercase block">Learning Resources:</span>
                  <p className="text-[10px] text-[#7D6B5D] italic">{sch.resources}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#F2EDE4] p-3 rounded-2xl text-[10px] font-bold text-[#7D6B5D] text-center">
            * All schemes adhere cleanly to the National Curriculum Development Centre (NCDC) ECD handbook guidelines.
          </div>
        </div>

      </div>

    </div>
  );
}
