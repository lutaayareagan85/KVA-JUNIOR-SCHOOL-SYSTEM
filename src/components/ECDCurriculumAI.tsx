import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Download, 
  Loader2, 
  Printer, 
  Copy, 
  Check, 
  FileText, 
  Layers, 
  Languages, 
  HelpCircle, 
  PlusCircle, 
  AlertCircle, 
  Calendar,
  Undo,
  Volume2,
  BookmarkCheck,
  Briefcase
} from 'lucide-react';

interface CurriculumSheet {
  id: string;
  gradeLevel: string;
  contentType: string;
  subjectArea: string;
  topic: string;
  term: string;
  language: string;
  timestamp: string;
  text: string;
}

const COMMON_TOPICS_BY_AREA: Record<string, string[]> = {
  // ECD (Pre-Primary) Subject Areas
  "Language Development & Vocabulary Play": [
    "Our School & My Friends",
    "Body Parts & Senses",
    "Greetings & Polite Phrases",
    "Storytelling: Interactive Lion & Hare",
    "Pre-reading shapes & tracing lines"
  ],
  "Mathematical Play & Quantitative Relations": [
    "Numbers 1 to 5: counting with pebbles",
    "Big vs Small: sorting kitchen plates",
    "Shapes in the Playground (Circles & Squares)",
    "More vs Less: Porridge cup levels",
    "Pattern play with multi-colored strings"
  ],
  "Social & Emotional Development (Interpersonal skills)": [
    "Sharing toys at sandbox playtime",
    "Identifying My Emotions (Happy, Sad, Angry)",
    "Helping Tr. Florence in the classroom",
    "Following simple rules in singing circles",
    "Saying Sorry and reconciling"
  ],
  "Health, Handwashing & Physical Activities": [
    "Washing Hands with soap before uji",
    "Brushing My Teeth: morning game",
    "Playground hopping & balancing acts",
    "Fruit Day: learning we eat oranges & bananas",
    "Cleaning up trash from the veranda"
  ],
  "Creative Arts & Local Materials (Singing, motor-skills, crafts)": [
    "Molding animals with local swamp clay",
    "Weaving a small mat with banana fiber",
    "Tearing & pasting recycled newspaper",
    "Making a shaker bottle with pebbles and plastic",
    "Action song: 'Obulamu bwa Kabeere'"
  ],
  "Religious & Moral Development": [
    "Showing love & kindness to sick classmates",
    "Simple thankful prayers for food/uji",
    "Respecting elders and grandparents",
    "Caring for plants & classroom flowers"
  ],

  // Primary School Subject Areas
  "English Language & Grammar": [
    "Nouns & Pronouns in sentences",
    "Verb Tenses (Present, Past, Future Continuous)",
    "Reading Comprehension: Our Village Life",
    "Letter Writing: Formal vs Informal",
    "Prepositions & Conjunctions"
  ],
  "Primary Mathematics": [
    "Place Values & Whole Numbers",
    "Fractions: Addition & Subtraction",
    "Basic Geometry: Angles, Triangles & Perimeters",
    "Primary Algebra: Simple Equations",
    "Data Handling: Tallies & Bar Charts"
  ],
  "Integrated Science": [
    "Human Body Systems & Respiratory organs",
    "Crop Husbandry & Plant Germination",
    "Vector-borne Diseases (Malaria & Sanitation)",
    "Weather, Rainfall Cycle & Climate",
    "Energy: Heat, Light & Simple Circuits"
  ],
  "Social Studies (SST)": [
    "Our Sub-County / District Resources",
    "Leadership Structures & Civic Roles in Uganda",
    "Physical Features of East Africa",
    "Administrative History & Early Explorers",
    "Economic Activities (Farming, Trade, Mining)"
  ],
  "Religious Education (Christian / Islamic)": [
    "The Creation Story & Human Responsibility",
    "Kindness & Service in the Community (The Good Samaritan)",
    "The Pillars of faith and prayer guidelines",
    "Honesty, Integrity and Good Deeds",
    "Respect for Sacred places and cultures"
  ],
  "Creative Arts, Crafts & Physical Education (CAP-PE)": [
    "Designing functional clay pots or cups",
    "Music: Singing the Uganda National Anthem & Part harmony",
    "Folk Dances of Uganda: Bakisimba / Dingi Dingi",
    "Athletics: Relay races and physical endurance",
    "Puppet making with local textile bits"
  ]
};

export default function ECDCurriculumAI() {
  const [category, setCategory] = useState<'ECD' | 'Primary'>('ECD');
  const [gradeLevel, setGradeLevel] = useState('KG1 (3-4 yrs)');
  const [contentType, setContentType] = useState('lesson_plan');
  const [subjectArea, setSubjectArea] = useState('Language Development & Vocabulary Play');
  const [topic, setTopic] = useState('Our School & My Friends');
  const [customTopic, setCustomTopic] = useState('');
  const [term, setTerm] = useState('Term 2');
  const [language, setLanguage] = useState('Luganda');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // App engine states
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [savedCurriculums, setSavedCurriculums] = useState<CurriculumSheet[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableText, setEditableText] = useState('');

  // Dual categories auto reset effect
  useEffect(() => {
    if (category === 'ECD') {
      setGradeLevel('KG1 (3-4 yrs)');
      setSubjectArea('Language Development & Vocabulary Play');
      setTopic('Our School & My Friends');
    } else {
      setGradeLevel('Primary 1 (P1)');
      setSubjectArea('English Language & Grammar');
      setTopic('Nouns & Pronouns in sentences');
    }
    setCustomTopic('');
  }, [category]);

  // Sample default content to show when starting
  useEffect(() => {
    const saved = localStorage.getItem('kva_saved_curriculums') || localStorage.getItem('sanyu_saved_curriculums');
    if (saved) {
      setSavedCurriculums(JSON.parse(saved));
    }
  }, []);

  // Sync saved list to local storage
  const saveToLocalStorage = (list: CurriculumSheet[]) => {
    localStorage.setItem('kva_saved_curriculums', JSON.stringify(list));
    setSavedCurriculums(list);
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const area = e.target.value;
    setSubjectArea(area);
    const defaults = COMMON_TOPICS_BY_AREA[area] || [];
    if (defaults.length > 0) {
      setTopic(defaults[0]);
    } else {
      setTopic('');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);
    setGeneratedContent('');
    setIsEditing(false);

    const activeTopic = customTopic.trim() ? customTopic : topic;

    try {
      const response = await fetch('/api/gemini/generate-curriculum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gradeLevel,
          contentType,
          subjectArea,
          topic: activeTopic,
          term,
          language,
          additionalNotes,
          educationLevel: category
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to communicate with AI Curriculum server node.');
      }

      setGeneratedContent(data.text);
      setEditableText(data.text);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'An error occurred during curriculum assembly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    const textToCopy = isEditing ? editableText : generatedContent;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to preview printed curriculum material.');
      return;
    }

    const titleText = `${contentType === 'lesson_plan' ? 'LESSON PLAN' : contentType === 'scheme_work' ? 'SCHEME OF WORK' : 'TEACHER ACTION NOTES'} - ${topic}`;
    const formattedHtml = (isEditing ? editableText : generatedContent)
      .replace(/\n/g, '<br />')
      .replace(/### (.*?)(<br \/>|$)/g, '<h4 style="color:#5A3E2B; margin-top:20px; font-size:16px;">$1</h4>')
      .replace(/## (.*?)(<br \/>|$)/g, '<h3 style="color:#3D2B1F; border-bottom:1px solid #7D6B5D; padding-bottom:5px; margin-top:25px; font-size:18px;">$1</h3>')
      .replace(/# (.*?)(<br \/>|$)/g, '<h2 style="color:#8C5A3C; font-size:22px; text-align:center;">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    printWindow.document.write(`
      <html>
        <head>
          <title>${titleText}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              color: #3D2B1F;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 3px double #8C5A3C;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              text-transform: uppercase;
              color: #3D2B1F;
            }
            .header p {
              margin: 5px 0 0;
              color: #7D6B5D;
              font-size: 13px;
              font-weight: bold;
            }
            .meta-box {
              background-color: #FDFBF7;
              border: 1px solid #E0D8CC;
              border-radius: 12px;
              padding: 15px;
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 10px;
              margin-bottom: 30px;
              font-size: 11px;
              font-weight: bold;
            }
            .meta-item span {
              color: #7D6B5D;
              text-transform: uppercase;
              display: block;
              font-size: 9px;
              margin-bottom: 2px;
            }
            .content-block {
              font-size: 13px;
            }
            blockquote {
              background: #FDFBF7;
              border-left: 4px solid #6B8E23;
              margin: 1.5em 10px;
              padding: 0.5em 10px;
              font-style: italic;
            }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Kids Villa Academy Preschool & Daycare</h1>
            <p>Integrated Play-Based Early Childhood Curriculum Guide</p>
          </div>
          
          <div class="meta-box">
            <div class="meta-item"><span>Target Age Class</span>${gradeLevel}</div>
            <div class="meta-item"><span>Assigned Term</span>${term} Academic Year</div>
            <div class="meta-item"><span>Subject Theme</span>${subjectArea}</div>
            <div class="meta-item"><span>Active Topic</span>${customTopic.trim() ? customTopic : topic}</div>
            <div class="meta-item"><span>Primary Language Target</span>Local Translation in ${language} Included</div>
            <div class="meta-item"><span>Issued Origin</span>Generated with Kids Villa ECD AI Engine</div>
          </div>

          <div class="content-block">
            ${formattedHtml}
          </div>

          <hr style="margin-top: 50px; border: 0; border-top: 1px dashed #E0D8CC;" />
          <p style="text-align: center; color: #7D6B5D; font-size: 10px; font-weight: bold; margin-top: 20px;">
            Certified under NCDC Pre-Primary Syllabus Frameworks. 
            Printed from Kids Villa Academy Offline PWA, Wakiso District, Uganda.
          </p>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveToCurated = () => {
    const textToSave = isEditing ? editableText : generatedContent;
    if (!textToSave) return;

    const newCurriculum: CurriculumSheet = {
      id: 'CUR-' + Date.now(),
      gradeLevel,
      contentType,
      subjectArea,
      topic: customTopic.trim() ? customTopic : topic,
      term,
      language,
      timestamp: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      text: textToSave
    };

    const updated = [newCurriculum, ...savedCurriculums];
    saveToLocalStorage(updated);
    setSelectedSavedId(newCurriculum.id);
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedCurriculums.filter(c => c.id !== id);
    saveToLocalStorage(updated);
    if (selectedSavedId === id) {
      if (updated.length > 0) {
        setSelectedSavedId(updated[0].id);
        setGeneratedContent(updated[0].text);
        setEditableText(updated[0].text);
        setIsEditing(false);
      } else {
        setSelectedSavedId(null);
        setGeneratedContent('');
        setEditableText('');
        setIsEditing(false);
      }
    }
  };

  const loadSavedItem = (item: CurriculumSheet) => {
    setSelectedSavedId(item.id);
    setGeneratedContent(item.text);
    setEditableText(item.text);
    setGradeLevel(item.gradeLevel);
    setContentType(item.contentType);
    setSubjectArea(item.subjectArea);
    setTopic(item.topic);
    setTerm(item.term);
    setLanguage(item.language);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Header banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#3D2B1F] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#8C5A3C]" />
            Uganda NCDC Curriculum & Interactive Play AI Builder
          </h2>
          <p className="text-xs text-[#7D6B5D] mt-1 pr-6 leading-relaxed">
            Co-design customized, child-centered schemes of work, detailed lesson plans, and interactive rhymes matching the <strong>National Curriculum Development Centre (NCDC)</strong> standards for Uganda pre-schools.
          </p>
        </div>
        <span className="bg-[#6B8E23] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shrink-0">
          Play-Based Syllabus Tool
        </span>
      </div>

      {/* Main workspace splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Interactive Parameters Side: Column size 5 */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC] space-y-4">
            <div className="border-b border-[#F2EDE4] pb-3">
              <h3 className="font-extrabold text-[#5A3E2B] text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Lesson Assembly Parameters
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Define topics, term levels, local language dialects, or physical play components.</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs font-semibold text-[#5A3E2B]">
              
              {/* Category selector */}
              <div>
                <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider block mb-1.5">Syllabus Education Level</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('ECD')}
                    className={`py-2 px-3 rounded-xl text-[11px] font-extrabold transition-all border cursor-pointer ${
                      category === 'ECD'
                        ? 'bg-[#8C5A3C] text-white border-[#8C5A3C] shadow-2xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    👶 Pre-Primary (ECD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('Primary')}
                    className={`py-2 px-3 rounded-xl text-[11px] font-extrabold transition-all border cursor-pointer ${
                      category === 'Primary'
                        ? 'bg-[#8C5A3C] text-white border-[#8C5A3C] shadow-2xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    🏫 Primary (P1 - P7)
                  </button>
                </div>
              </div>

              {/* Class Level age range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider block mb-1">Grade / Class Level</label>
                  <select 
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full p-2.5 border border-[#E0D8CC] rounded-xl bg-stone-50 font-bold text-[#3D2B1F]"
                  >
                    {category === 'ECD' ? (
                      <>
                        <option value="KG1 (3-4 yrs)">KG1 (3-4 yrs)</option>
                        <option value="KG2 (4-5 yrs)">KG2 (4-5 yrs)</option>
                        <option value="KG3 (5-6 yrs)">KG3 (5-6 yrs)</option>
                      </>
                    ) : (
                      <>
                        <option value="Primary 1 (P1)">Primary 1 (P1)</option>
                        <option value="Primary 2 (P2)">Primary 2 (P2)</option>
                        <option value="Primary 3 (P3)">Primary 3 (P3)</option>
                        <option value="Primary 4 (P4)">Primary 4 (P4)</option>
                        <option value="Primary 5 (P5)">Primary 5 (P5)</option>
                        <option value="Primary 6 (P6)">Primary 6 (P6)</option>
                        <option value="Primary 7 (P7)">Primary 7 (P7)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider block mb-1">Content Type</label>
                  <select 
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full p-2.5 border border-[#E0D8CC] rounded-xl bg-stone-50 font-bold text-[#3D2B1F]"
                  >
                    <option value="lesson_plan">📋 Detailed Lesson Plan</option>
                    <option value="scheme_work">🗓️ Scheme of Work Outline</option>
                    <option value="notes">🎵 Activity Notes & Songs</option>
                  </select>
                </div>
              </div>

              {/* Term & Local translation details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider block mb-1">Syllabus Term</label>
                  <select 
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full p-2.5 border border-[#E0D8CC] rounded-xl bg-stone-50 text-[#3D2B1F]"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider block mb-1">Local Language Adapter</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2.5 border border-[#E0D8CC] rounded-xl bg-stone-50 text-[#3D2B1F]"
                  >
                    <option value="English Only">English (Standard)</option>
                    <option value="Luganda">Luganda (Central / Kampala)</option>
                    <option value="Runyankole">Runyankole (Western)</option>
                    <option value="Acholi">Acholi (Northern)</option>
                    <option value="Iteso">Iteso (Eastern)</option>
                    <option value="Lusoga">Lusoga (Eastern-Central)</option>
                  </select>
                </div>
              </div>

              {/* Subject Theme */}
              <div>
                <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider block mb-1">NCDC Learning Area Theme</label>
                <select 
                  value={subjectArea}
                  onChange={handleAreaChange}
                  className="w-full p-2.5 border border-[#E0D8CC] rounded-xl bg-stone-50 text-[#3D2B1F]"
                >
                  {category === 'ECD' ? (
                    <>
                      <option value="Language Development & Vocabulary Play">Language Development & Vocabulary Play</option>
                      <option value="Mathematical Play & Quantitative Relations">Mathematical Play & Quantitative Relations</option>
                      <option value="Social & Emotional Development (Interpersonal skills)">Social & Emotional Development (Interpersonal skills)</option>
                      <option value="Health, Handwashing & Physical Activities">Health, Handwashing & Physical Activities</option>
                      <option value="Creative Arts & Local Materials (Singing, motor-skills, crafts)">Creative Arts & Local Materials (Singing, motor-skills, crafts)</option>
                      <option value="Religious & Moral Development">Religious & Moral Development</option>
                    </>
                  ) : (
                    <>
                      <option value="English Language & Grammar">English Language & Grammar</option>
                      <option value="Primary Mathematics">Primary Mathematics</option>
                      <option value="Integrated Science">Integrated Science</option>
                      <option value="Social Studies (SST)">Social Studies (SST)</option>
                      <option value="Religious Education (Christian / Islamic)">Religious Education (Christian / Islamic)</option>
                      <option value="Creative Arts, Crafts & Physical Education (CAP-PE)">Creative Arts, Crafts & Physical Education (CAP-PE)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Subject Topic (dynamic based on Learning Area) */}
              <div>
                <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider block mb-1">Select Study Topic Blueprint</label>
                <select 
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setCustomTopic('');
                  }}
                  disabled={!!customTopic}
                  className="w-full p-2.5 border border-[#E0D8CC] rounded-xl bg-stone-50 text-[#3D2B1F] disabled:opacity-50"
                >
                  {(COMMON_TOPICS_BY_AREA[subjectArea] || []).map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Or input custom topic */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider block">Or Custom Topic / Project Study</label>
                  {customTopic && (
                    <button 
                      type="button" 
                      onClick={() => setCustomTopic('')}
                      className="text-[9px] text-red-600 font-bold hover:underline"
                    >
                      Use blueprint list [x]
                    </button>
                  )}
                </div>
                <input 
                  type="text"
                  placeholder="e.g. Traditional dress, hygiene of our playground, numbers 10 to 20"
                  value={customTopic}
                  onChange={(e) => {
                    setCustomTopic(e.target.value);
                  }}
                  className="w-full p-2.5 border border-[#E0D8CC] rounded-xl bg-[#FDFBF7] text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Additional Contextual Details (props, toys, materials on hand) */}
              <div>
                <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider block mb-1">
                  On-Hand Class Materials & Instructions (Optional)
                </label>
                <textarea 
                  rows={2}
                  placeholder="e.g. 'I have local banana fibers, 5 empty plastic uji cups, and colored bottle caps.' or 'Incorporate the playgroup table.'"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full p-2.5 border border-[#E0D8CC] rounded-xl bg-[#FDFBF7] text-stone-900 text-xs resize-none"
                />
              </div>

              {/* Action buttons */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#8C5A3C] hover:bg-[#72482e] text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-xs shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Assembling Lesson Curriculum...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Playgroup Sheet with AI</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Curated list / saved lesson plans history in localStorage */}
          <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC] space-y-3">
            <h4 className="font-bold text-[#5A3E2B] text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-[#F2EDE4] pb-2">
              <BookmarkCheck className="w-4 h-4 text-[#6B8E23]" />
              Curated Curriculum Sheets ({savedCurriculums.length})
            </h4>

            {savedCurriculums.length === 0 ? (
              <p className="text-[11px] text-[#7D6B5D] italic">
                No custom guides saved under this session yet. Build a sheet above and save it to curate your preschool folder offline.
              </p>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {savedCurriculums.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => loadSavedItem(item)}
                    className={`p-3 text-xs rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all text-left ${
                      selectedSavedId === item.id 
                        ? 'bg-amber-50/40 border-amber-300 shadow-3xs' 
                        : 'bg-stone-50/70 border-stone-200/80 hover:bg-stone-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex gap-1.5 mb-1.5">
                        <span className="text-[8px] font-black uppercase text-stone-500 bg-white border border-stone-200 px-1.5 py-0.5 rounded">
                          {item.contentType === 'lesson_plan' ? 'Plan' : item.contentType === 'scheme_work' ? 'Scheme' : 'Notes'}
                        </span>
                        <span className="text-[8px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                          {item.gradeLevel.split(' ')[0]}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-[#3D2B1F] truncate text-xs leading-none">{item.topic}</h5>
                      <span className="block text-[9px] text-[#7D6B5D] mt-1 italic font-medium font-mono">{item.timestamp}</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSaved(item.id, e)}
                      className="text-[#7D6B5D] hover:text-red-600 transition-colors cursor-pointer p-0.5"
                      title="Delete saved sheet"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Output Side: Column size 7 */}
        <div className="lg:col-span-7 flex flex-col h-full space-y-4 min-h-[500px]">
          
          {/* Active Workpiece Sheet Card */}
          <div className="bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden flex flex-col flex-1 shadow-sm">
            
            {/* Display header of generated block */}
            <div className="px-6 py-4.5 border-b border-[#F2EDE4] bg-[#FDFBF7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-[#5A3E2B] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#8C5A3C]" />
                  ECD Curriculum Interactive Builder
                </h4>
                <p className="text-xs text-[#7D6B5D] mt-0.5">
                  {isLoading ? 'Consulting curriculum intelligence nodes...' : 'Play-based blueprint generated in response coordinates.'}
                </p>
              </div>

              {/* Controls bar */}
              {(generatedContent || selectedSavedId) && (
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      if (!isEditing) {
                        setIsEditing(true);
                      } else {
                        // save edits
                        setGeneratedContent(editableText);
                        setIsEditing(false);
                        // if saved, sync text
                        if (selectedSavedId) {
                          const updated = savedCurriculums.map(c => 
                            c.id === selectedSavedId ? { ...c, text: editableText } : c
                          );
                          saveToLocalStorage(updated);
                        }
                      }
                    }}
                    className="bg-stone-100 hover:bg-stone-200 text-[#3D2B1F] border border-stone-250 font-bold text-[10px] py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    {isEditing ? 'Save Changes' : '📝 Inline Edit'}
                  </button>
                  
                  <button
                    onClick={handleCopyToClipboard}
                    className="bg-stone-100 hover:bg-stone-200 text-[#3D2B1F] border border-stone-250 font-bold text-[10px] py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="bg-[#6B8E23] hover:bg-[#58751d] text-white font-black text-[10px] py-1.5 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Guide
                  </button>
                </div>
              )}
            </div>

            {/* Content area */}
            <div className="p-6 flex-1 flex flex-col justify-between min-h-[440px] bg-white">
              
              {isLoading ? (
                <div className="my-auto py-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-[#8C5A3C]">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-700" />
                  </div>
                  <div className="text-center space-y-1.5 max-w-sm">
                    <h5 className="font-black text-sm text-[#3D2B1F]">Weaving Ugandan ECD Lesson Sheets</h5>
                    <p className="text-xs text-[#7D6B5D] leading-snug">
                      Adding local nursery rhymes, incorporating tactile props, and structuring sensory progress tasks...
                    </p>
                  </div>
                  
                  {/* Decorative background tips */}
                  <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#E0D8CC] text-[10px] text-zinc-500 max-w-xs space-y-2 mt-6">
                    <p className="font-extrabold text-[#8C5A3C] uppercase text-[9px] tracking-widest text-center">ECD Curriculum Tips</p>
                    <p className="leading-snug">Pre-school lessons in Uganda are designed around five child domains. Play-based physical props are more effective than blackboard lectures.</p>
                  </div>
                </div>
              ) : apiError ? (
                <div className="my-auto py-12 flex flex-col items-center justify-center max-w-md mx-auto space-y-3.5 text-center">
                  <div className="p-3 bg-red-50 text-red-500 rounded-full border border-red-100">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="font-black text-sm text-red-800">Curriculum assembly halted</h5>
                    <p className="text-xs text-red-700 font-medium leading-relaxed mt-1">
                      {apiError}
                    </p>
                  </div>
                  <p className="text-[10px] text-[#7D6B5D] bg-[#FDFBF7] p-3 rounded-xl border border-stone-200">
                    💡 Check that you have an active internet connection and that your <strong>GEMINI_API_KEY</strong> is loaded correctly under <strong>Settings &gt; Secrets</strong>.
                  </p>
                </div>
              ) : (generatedContent || selectedSavedId) ? (
                <div className="flex flex-col h-full justify-between gap-6 text-xs text-[#3D2B1F]">
                  <div className="flex-1 overflow-y-auto pr-1 max-h-[500px]">
                    
                    {isEditing ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider block">Modify Lesson Draft Content Interactively</label>
                        <textarea
                          value={editableText}
                          onChange={(e) => setEditableText(e.target.value)}
                          className="w-full h-[400px] p-4 font-mono text-xs border border-[#E0D8CC] rounded-2xl bg-[#FFFFFC] focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 leading-relaxed"
                        />
                      </div>
                    ) : (
                      <div className="prose prose-stone max-w-none text-left leading-relaxed space-y-4 font-sans whitespace-pre-wrap select-all">
                        {/* Custom parse formatting of markdown headlines for premium presentation */}
                        {formatMarkdown(generatedContent)}
                      </div>
                    )}
                  </div>

                  {/* Actions bar */}
                  <div className="pt-4 border-t border-[#F2EDE4] flex justify-between items-center bg-white">
                    <div className="text-[10px] text-[#7D6B5D] font-mono leading-none">
                      Words count: {(isEditing ? editableText : generatedContent).split(/\s+/).length} | Class: {gradeLevel.split(' ')[0]}
                    </div>

                    {!savedCurriculums.some(c => c.text === (isEditing ? editableText : generatedContent)) && (
                      <button
                        onClick={handleSaveToCurated}
                        className="bg-white hover:bg-stone-50 text-[#8C5A3C] hover:text-[#72482e] border border-[#E0D8CC] font-bold text-[10.5px] py-1.5 px-3.5 rounded-xl cursor-pointer transition-all flex items-center gap-1 shrink-0"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        Save to Curated Folder
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="my-auto py-12 flex flex-col items-center justify-center max-w-sm mx-auto space-y-3.5 text-center">
                  <div className="p-4 bg-[#FDFBF7] rounded-3xl border border-dashed border-[#E0D8CC] text-[#7D6B5D]">
                    <Sparkles className="w-8 h-8 text-[#8C5A3C] opacity-40 mx-auto" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-[#3D2B1F]">Awaiting Curriculum Selection</h5>
                    <p className="text-xs text-[#7D6B5D] leading-relaxed mt-1">
                      Choose a study topic, age grade, and language above. Tap "Generate Playgroup Sheet" to assemble comprehensive, play-based lesson outlines.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Offline disclaimer */}
            <div className="bg-[#F2EDE4] px-6 py-3 border-t border-[#EAE4D9] text-[10px] text-[#7D6B5D] font-extrabold text-center uppercase tracking-widest flex items-center justify-center gap-1.5 shrink-0">
              <Briefcase className="w-3.5 h-3.5 text-stone-500" />
              <span>Certified Play-Based Learning Module • Kampala Modern Kindergarten Standards</span>
            </div>
          </div>

          {/* Quick guides/syllabus metrics card at bottom */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-stone-900 text-white p-4 rounded-2xl flex items-start gap-3">
              <Volume2 className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider">Musical Play</span>
                <p className="text-[11px] leading-snug text-zinc-300 mt-0.5">Integrates local songs and shakers to sustain attention in nursery groups.</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E0D8CC] flex items-start gap-3">
              <Layers className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[8px] font-black uppercase text-[#7D6B5D] tracking-wider">NCDC alignment</span>
                <p className="text-[11px] leading-snug text-[#3D2B1F] mt-0.5">Fully aligned with Termly learning competence matrices of Uganda.</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E0D8CC] flex items-start gap-3">
              <Languages className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="block text-[8px] font-black uppercase text-[#7D6B5D] tracking-wider">Multilingual Play</span>
                <p className="text-[11px] leading-snug text-[#3D2B1F] mt-0.5">Local translation triggers help children bridge conceptual understanding.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

// Simple helper to beautifully render basic markdown in react without imposing too many dependencies
function formatMarkdown(markdownText: string) {
  if (!markdownText) return null;

  const lines = markdownText.split('\n');
  return lines.map((line, idx) => {
    // Check headers
    if (line.startsWith('# ')) {
      return (
        <h2 key={idx} className="text-base font-black text-[#3D2B1F] mt-6 border-b border-[#E0D8CC] pb-1 uppercase tracking-tight">
          {line.replace('# ', '')}
        </h2>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={idx} className="text-sm font-black text-[#5A3E2B] mt-5 pb-0.5 border-b border-[#F2EDE4] flex items-center">
          <span className="w-2 h-2 rounded-full bg-[#6B8E23] mr-2"></span>
          {line.replace('## ', '')}
        </h3>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="text-xs font-extrabold text-[#7D6B5D] mt-4 uppercase tracking-wider block font-mono">
          {line.replace('### ', '')}
        </h4>
      );
    }
    
    // Check blockquote
    if (line.startsWith('> ')) {
      return (
        <blockquote key={idx} className="border-l-4 border-[#6B8E23] pl-3.5 py-1 my-2 bg-stone-50 rounded-r-lg italic text-[#5A3E2B] text-xs">
          {line.replace('> ', '')}
        </blockquote>
      );
    }

    // Check list item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const formattedText = parseInlineBold(line.substring(2));
      return (
        <div key={idx} className="flex items-start gap-2.5 pl-3 py-0.5 my-1 leading-relaxed">
          <span className="text-[#8C5A3C] font-black shrink-0 select-none text-[11px] mt-0.5">☉</span>
          <span className="flex-1 text-[#3D2B1F]">{formattedText}</span>
        </div>
      );
    }

    // Numbered list item
    if (/^\d+\.\s/.test(line)) {
      const cleaned = line.replace(/^\d+\.\s/, '');
      const formattedText = parseInlineBold(cleaned);
      const num = line.match(/^\d+/)?.toString();
      return (
        <div key={idx} className="flex items-start gap-2.5 pl-3 py-1 my-1 leading-relaxed">
          <span className="bg-[#E8F1D7] text-[#6B8E23] rounded-md px-1.5 py-px shrink-0 font-black text-[9px] font-mono mt-0.5">{num}</span>
          <span className="flex-1 text-[#3D2B1F]">{formattedText}</span>
        </div>
      );
    }

    // Normal paragraph line
    if (line.trim() === '') {
      return <div key={idx} className="h-2.5" />;
    }

    return (
      <p key={idx} className="leading-relaxed text-[#3D2B1F]">
        {parseInlineBold(line)}
      </p>
    );
  });
}

// Helper to render inline **bold** text tags properly
function parseInlineBold(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  if (parts.length === 1) return text;
  
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-extrabold text-[#3D2B1F] bg-amber-50/20 px-0.5 rounded">{part}</strong>;
    }
    return part;
  });
}
