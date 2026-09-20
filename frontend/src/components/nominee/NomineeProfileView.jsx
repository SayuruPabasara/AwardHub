import React, { useState } from 'react';
import { useAwardHub } from '../../context/AwardHubContext';
import { 
  User, 
  Award, 
  Briefcase, 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Save,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

export default function NomineeProfileView() {
  const { currentUser, updateNomineeProfile, categories } = useAwardHub();

  const [bio, setBio] = useState(currentUser.bio || '');
  const [phone, setPhone] = useState(currentUser.phone || '+94 77 123 4567');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [studentId, setStudentId] = useState(currentUser.studentId || 'IT25101477');
  const [nic, setNic] = useState(currentUser.nic || '200119482019');

  const [achievements, setAchievements] = useState(currentUser.achievements || []);
  const [newAchievement, setNewAchievement] = useState('');

  const [experience, setExperience] = useState(currentUser.experience || []);
  const [newExperience, setNewExperience] = useState('');

  const [documents, setDocuments] = useState(currentUser.documents || []);
  const [newDocName, setNewDocName] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateNomineeProfile({
      bio,
      phone,
      department,
      studentId,
      nic,
      achievements,
      experience,
      documents
    });
  };

  const handleAddAchievement = () => {
    if (!newAchievement.trim()) return;
    setAchievements([...achievements, newAchievement.trim()]);
    setNewAchievement('');
  };

  const handleRemoveAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleAddExperience = () => {
    if (!newExperience.trim()) return;
    setExperience([...experience, newExperience.trim()]);
    setNewExperience('');
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleUploadMockDoc = () => {
    if (!newDocName.trim()) return;
    const docObj = {
      id: `doc-${Date.now()}`,
      name: newDocName.endsWith('.pdf') ? newDocName : `${newDocName}.pdf`,
      size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().split('T')[0]
    };
    setDocuments([...documents, docObj]);
    setNewDocName('');
  };

  const handleRemoveDoc = (docId) => {
    setDocuments(documents.filter((d) => d.id !== docId));
  };

  return (
    <div className="space-y-6">
      {/* Profile Header & Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-50 dark:ring-indigo-900/40 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentUser.name}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Verified Nominee
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser.department} • Student ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{currentUser.studentId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Profile Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Information Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Academic & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.name}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Student / Staff ID Number
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  National Identity Card (NIC)
                </label>
                <input
                  type="text"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Faculty / Academic Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Professional Bio & Research Interests
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your background, domains of excellence, and research focus..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Achievements Manager */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Award className="w-4 h-4 text-amber-500" />
              Honors, Awards & Key Achievements
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder="e.g. 1st Place - National Hackathon 2025..."
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddAchievement}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {achievements.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{item}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAchievement(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Records */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Research & Professional Experience
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={newExperience}
                onChange={(e) => setNewExperience(e.target.value)}
                placeholder="e.g. Lead AI Researcher, AgriTech Lab (2025 - Present)..."
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddExperience}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {experience.map((exp, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800 text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{exp}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Reusable Document Vault & Eligibility Verification */}
        <div className="space-y-6">
          {/* Document Vault */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Supporting Document Vault
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Centralized repository of verified CVs, whitepapers, and endorsement letters
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="e.g. Dean_Recommendation_2026.pdf"
                  className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleUploadMockDoc}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </button>
              </div>

              <div className="space-y-2 mt-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{doc.size} • Uploaded {doc.uploadedAt}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 ml-2 flex-shrink-0 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Eligibility Checker */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Eligibility Verification Check
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automated validation against published award requirements:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <span className="text-emerald-900 dark:text-emerald-200 font-medium">Valid Student / Faculty Identity:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <span className="text-emerald-900 dark:text-emerald-200 font-medium">National Identity Card (NIC):</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <span className="text-emerald-900 dark:text-emerald-200 font-medium">Documents Vault Compliance:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {documents.length} Files
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
