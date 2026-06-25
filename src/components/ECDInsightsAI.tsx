import React, { useState } from 'react';
import { Sparkles, Brain, AlertTriangle, ArrowUpRight, TrendingUp, CheckCircle, HelpCircle } from 'lucide-react';

interface PredictionRow {
  studentName: string;
  classLevel: string;
  attendanceRisk: 'High Risk' | 'Moderate' | 'Good Attendance';
  defaultRisk: 'High Default Risk' | 'Minor Risk' | 'Fully Clear';
  strengthSector: string;
  earlyInterventionAdvice: string;
}

const INITIAL_PREDICTIONS: PredictionRow[] = [
  {
    studentName: 'Babirye Shifra',
    classLevel: 'KG1',
    attendanceRisk: 'Good Attendance',
    defaultRisk: 'High Default Risk',
    strengthSector: 'Language & Sound Imitation',
    earlyInterventionAdvice: ' tuition fee payment default predicted next week. Send MomO soft warning reminder before examinations close out.'
  },
  {
    studentName: 'Mukasa Ronald',
    classLevel: 'KG2',
    attendanceRisk: 'High Risk',
    defaultRisk: 'Fully Clear',
    strengthSector: 'Mathematical Block Sorting',
    earlyInterventionAdvice: 'Low attendance is limiting language milestones entry. Call parents to inspect any sickbay illness trends.'
  },
  {
    studentName: 'Kato Ivan',
    classLevel: 'KG3',
    attendanceRisk: 'Moderate',
    defaultRisk: 'Minor Risk',
    strengthSector: 'Social play & Sharing',
    earlyInterventionAdvice: 'Needs extra play sound tracing practices during afternoon Porridge Recess. Support using clay modeling.'
  }
];

export function ECDInsightsAI() {
  const [predictions, setPredictions] = useState<PredictionRow[]>(INITIAL_PREDICTIONS);
  const [customStudent, setCustomStudent] = useState('');
  const [customStrength, setCustomStrength] = useState('Mathematical Play');
  const [customAttendance, setCustomAttendance] = useState('Moderate');
  const [isComputing, setIsComputing] = useState(false);

  const handleComputeAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStudent) return;
    setIsComputing(true);
    setTimeout(() => {
      setIsComputing(false);
      const output: PredictionRow = {
        studentName: customStudent,
        classLevel: 'KG2',
        attendanceRisk: customAttendance === 'Moderate' ? 'Moderate' : customAttendance === 'High' ? 'High Risk' : 'Good Attendance',
        defaultRisk: 'Minor Risk',
        strengthSector: customStrength,
        earlyInterventionAdvice: `Recommend 3x weekly play sessions with tactile sensory clay tools. Low risk on curriculum standards progression.`
      };
      setPredictions([output, ...predictions]);
      setCustomStudent('');
    }, 1100);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Banner AI */}
      <div className="bg-[#8C5A3C] text-white p-6 rounded-3xl border border-[#7D6B5D]/25">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-[#E8F1D7]" /> Kids Villa ECD Automated Predictive Analytics
        </h3>
        <p className="text-xs text-white/95 mt-1 leading-relaxed">
          Unlock predictive algorithms that assess tuition default indicators and flag children with milestone delays early. Powered by simulated cognitive evaluations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Table of predictions */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#E0D8CC] space-y-4">
          <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#7D6B5D] flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#6B8E23]" /> Automated Risk Predictions list
          </h4>

          <div className="space-y-4 max-h-[385px] overflow-y-auto pr-1">
            {predictions.map((pred, i) => (
              <div key={i} className="p-4 bg-[#FDFBF7] rounded-3xl border border-[#E0D8CC]/80 space-y-2 text-xs">
                <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-gray-100">
                  <div>
                    <h5 className="font-extrabold text-[#3D2B1F]">{pred.studentName}</h5>
                    <span className="text-[10px] text-gray-400 font-semibold">{pred.classLevel}</span>
                  </div>

                  <div className="flex gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                      pred.attendanceRisk === 'High Risk' ? 'bg-[#F9ECE4] text-[#8C5A3C]' : 'bg-[#E8F1D7] text-[#6B8E23]'
                    }`}>
                      {pred.attendanceRisk}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                      pred.defaultRisk === 'Good Attendance' || pred.defaultRisk === 'Fully Clear' ? 'bg-[#E8F1D7] text-[#6B8E23]' : 'bg-red-50 text-red-600'
                    }`}>
                      {pred.defaultRisk}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1 text-[11px] leading-tight">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-[#8C5A3C] block">Core Strengths Domain:</span>
                    <strong className="text-gray-700">{pred.strengthSector}</strong>
                  </div>
                  <div className="col-span-2 space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-[#6B8E23] block">Early Intervention Guidance:</span>
                    <p className="text-xs text-gray-600 font-semibold">{pred.earlyInterventionAdvice}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generate predict options */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-[#E0D8CC] h-fit">
          <span className="text-[10px] font-bold text-[#8C5A3C] uppercase block mb-3">Trigger AI Performance Predictor</span>
          
          <form onSubmit={handleComputeAI} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Select / Write Student Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Babirye Shifra"
                value={customStudent}
                onChange={(e) => setCustomStudent(e.target.value)}
                className="w-full p-2.5 bg-[#FDFBF7] border border-[#E0D8CC] rounded-xl text-[#3D2B1F]"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Strongest NCDC Domain</label>
              <select
                value={customStrength}
                onChange={(e) => setCustomStrength(e.target.value)}
                className="w-full p-2.5 bg-[#FDFBF7] border border-[#E0D8CC] rounded-xl text-[#3D2B1F]"
              >
                <option value="Mathematical Play">Mathematical Logic & Sorting</option>
                <option value="LanguageSounds">Phonics & sound Imitation</option>
                <option value="Fine Arts Drawing">Creative Drawing / Clay Work</option>
                <option value="Outdoor Sports">Physical gross motor balance</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Attendance track</label>
              <select
                value={customAttendance}
                onChange={(e) => setCustomAttendance(e.target.value)}
                className="w-full p-2.5 bg-[#FDFBF7] border border-[#E0D8CC] rounded-xl text-[#3D2B1F]"
              >
                <option value="Optimal">Good (Less than 1 recess missed)</option>
                <option value="Moderate">Moderate (3 recess sessions missed)</option>
                <option value="High">Poor (Unexcused weeks absent)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isComputing}
              className="w-full bg-[#6B8E23] text-white py-2.5 rounded-xl font-bold hover:bg-[#58751d] transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-white" />
              {isComputing ? 'Simulating regression scoring...' : 'Generate Intervention Indicators'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
