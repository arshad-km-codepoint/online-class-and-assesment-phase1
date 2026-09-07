import React, { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { LiveInClassAssessment, LiveAssessmentQuestion } from '../types';
import {
  Video,
  Plus,
  Search,
  Copy,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
  Layers,
  Send,
  Zap,
  Award,
  ChevronDown,
  ChevronUp,
  FileCheck,
  X,
} from 'lucide-react';

export const OnlineClassAssessmentsView: React.FC = () => {
  const {
    liveAssessments,
    setActiveTab,
    deleteLiveAssessment,
    duplicateLiveAssessment,
    setEditingLiveAssessment,
    launchSavedAssessmentInClass,
    onlineClasses,
    activeLiveClass,
    setActiveLiveClass,
  } = useExam();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [expandedAssessmentId, setExpandedAssessmentId] = useState<string | null>(null);
  const [previewAssessment, setPreviewAssessment] = useState<LiveInClassAssessment | null>(null);
  const [launchModalAssessment, setLaunchModalAssessment] = useState<LiveInClassAssessment | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>(
    activeLiveClass?.id || onlineClasses[0]?.id || ''
  );

  // Filter logic
  const filteredAssessments = liveAssessments.filter((ass) => {
    const matchesSearch =
      ass.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ass.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ass.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || ass.subject === selectedSubject;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'draft' && ass.isDraft) ||
      (selectedStatus === 'active' && ass.status === 'active' && !ass.isDraft) ||
      (selectedStatus === 'published' && ass.status === 'published');
    const matchesClass =
      selectedClass === 'all' ||
      !ass.targetClass ||
      ass.targetClass.toLowerCase().includes(selectedClass.toLowerCase());
    return matchesSearch && matchesSubject && matchesStatus && matchesClass;
  });

  // Calculate statistics
  const totalAssessments = liveAssessments.length;
  const activeAssessmentsCount = liveAssessments.filter((a) => a.status === 'active').length;
  const draftAssessmentsCount = liveAssessments.filter((a) => a.isDraft || a.status === 'draft').length;

  const handleEdit = (assessment: LiveInClassAssessment) => {
    setEditingLiveAssessment(assessment);
    setActiveTab('create-class-assessment');
  };

  const handleCreateNew = () => {
    setEditingLiveAssessment(null);
    setActiveTab('create-class-assessment');
  };

  const handleDirectLaunch = (ass: LiveInClassAssessment) => {
    if (activeLiveClass) {
      launchSavedAssessmentInClass(ass.id, activeLiveClass.id);
      setActiveTab('live-classroom');
    } else {
      setLaunchModalAssessment(ass);
    }
  };

  const confirmLaunchInClass = () => {
    if (!launchModalAssessment) return;
    const chosenClass = onlineClasses.find((c) => c.id === targetClassId) || onlineClasses[0];
    if (chosenClass) {
      setActiveLiveClass(chosenClass);
    }
    launchSavedAssessmentInClass(launchModalAssessment.id, targetClassId);
    setLaunchModalAssessment(null);
    setActiveTab('live-classroom');
  };

  const renderQuestionTypeBadge = (type: LiveAssessmentQuestion['type']) => {
    switch (type) {
      case 'mcq':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            MCQ (Single)
          </span>
        );
      case 'mmcq':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            MMCQ (Multi-Select)
          </span>
        );
      case 'fill_in_blanks':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Fill in Blanks
          </span>
        );
      case 'match_following':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Match the Following
          </span>
        );
      case 'step_ordering':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            Sequence Ordering
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            Conceptual
          </span>
        );
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 space-y-6 w-full">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <span>Online Classes</span>
            <span>•</span>
            <span>Assessment Management Hub</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            Online Class Assessments & Quizzes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, save, and manage interactive spot quizzes (MCQ, MMCQ, Fill in the Blanks, Match the Following) ready to share during live sessions
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab('online-classes')}
            className="px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <Video className="w-4 h-4 text-slate-500" />
            <span>All Online Classes</span>
          </button>

          <button
            onClick={handleCreateNew}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create In-Class Assessment</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Saved Assessments
            </span>
            <span className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalAssessments}</p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Across all subjects & curricula
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active in Live Class
            </span>
            <span className="p-1.5 rounded-lg bg-red-100 text-red-600">
              <Zap className="w-4 h-4 animate-pulse" />
            </span>
          </div>
          <p className="text-2xl font-black text-red-600 mt-2">{activeAssessmentsCount}</p>
          <span className="text-[11px] text-red-700 font-semibold mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block" />
            Ready for real-time response
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Drafts in Progress
            </span>
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
              <Edit className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{draftAssessmentsCount}</p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Pending final review
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Question Types Supported
            </span>
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-purple-600 mt-2">4 Types</p>
          <span className="text-[10px] text-purple-700 font-bold mt-1 block">
            MCQ • MMCQ • Blanks • Matching
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search assessments by title, subject, or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="Computer Science">Computer Science</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Live</option>
            <option value="published">Completed/Published</option>
            <option value="draft">Drafts</option>
          </select>

          {/* Target Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Classes</option>
            <option value="Grade 12">Grade 12</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 10">Grade 10</option>
          </select>
        </div>
      </div>

      {/* Assessment Cards Grid */}
      <div className="space-y-4">
        {filteredAssessments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No Online Class Assessments Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No assessments match your current filter criteria. Create a new interactive assessment or clear the filters.
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-blue-700 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Assessment</span>
            </button>
          </div>
        ) : (
          filteredAssessments.map((ass) => {
            const isExpanded = expandedAssessmentId === ass.id;
            const mcqCount = ass.questions.filter((q) => q.type === 'mcq').length;
            const mmcqCount = ass.questions.filter((q) => q.type === 'mmcq').length;
            const blanksCount = ass.questions.filter((q) => q.type === 'fill_in_blanks').length;
            const matchCount = ass.questions.filter((q) => q.type === 'match_following').length;
            const stepCount = ass.questions.filter((q) => q.type === 'step_ordering').length;

            return (
              <div
                key={ass.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Card Header / Top Bar */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        {ass.subject}
                      </span>
                      {ass.targetClass && (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {ass.targetClass}
                        </span>
                      )}
                      {ass.status === 'active' && !ass.isDraft && (
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-red-100 text-red-700 border border-red-200 flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          Live Broadcast Active
                        </span>
                      )}
                      {ass.isDraft && (
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-100 text-amber-700 border border-amber-200">
                          Draft
                        </span>
                      )}
                      {ass.status === 'published' && !ass.isDraft && (
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Published / Shared
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 hover:text-blue-600 transition-colors">
                      {ass.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1">
                      <span className="font-semibold text-slate-700">Topic:</span> {ass.topic}
                    </p>

                    {/* Metadata Chips */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        {ass.durationSeconds > 0
                          ? `${Math.floor(ass.durationSeconds / 60)} Minutes Timer`
                          : 'Untimed'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        {ass.totalMarks} Total Marks
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Layers className="w-3.5 h-3.5 text-purple-600" />
                        {ass.questions.length} Questions
                      </span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-400">
                        Submissions: {ass.submissions.length}
                      </span>
                    </div>

                    {/* Question Type Breakdown Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {mcqCount > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {mcqCount} MCQ
                        </span>
                      )}
                      {mmcqCount > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {mmcqCount} MMCQ (Multi)
                        </span>
                      )}
                      {blanksCount > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {blanksCount} Blanks
                        </span>
                      )}
                      {matchCount > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {matchCount} Matching
                        </span>
                      )}
                      {stepCount > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {stepCount} Sequence Ordering
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDirectLaunch(ass)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Share to Live Class</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewAssessment(ass)}
                        title="Preview Student View"
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => handleEdit(ass)}
                        title="Edit Assessment"
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => duplicateLiveAssessment(ass.id)}
                        title="Duplicate Assessment"
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteLiveAssessment(ass.id)}
                        title="Delete Assessment"
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-600 text-xs transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setExpandedAssessmentId(isExpanded ? null : ass.id)}
                        className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs transition-all"
                        title={isExpanded ? 'Collapse Questions' : 'Expand Questions'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Questions Preview */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Included Questions ({ass.questions.length})
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Total Marks: {ass.totalMarks}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {ass.questions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900">Q{idx + 1}.</span>
                              {renderQuestionTypeBadge(q.type)}
                            </div>
                            <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                              {q.marks} Marks
                            </span>
                          </div>

                          <p className="text-slate-800 font-medium">{q.prompt}</p>

                          {/* MCQ / MMCQ Options Display */}
                          {(q.type === 'mcq' || q.type === 'mmcq') && q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                              {q.options.map((opt, optIdx) => {
                                const isCorrect =
                                  q.type === 'mcq'
                                    ? q.correctOptionIndex === optIdx
                                    : q.correctOptionIndices?.includes(optIdx);
                                return (
                                  <div
                                    key={optIdx}
                                    className={`px-2.5 py-1 rounded-lg border text-xs flex items-center justify-between ${
                                      isCorrect
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isCorrect && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Match the following preview */}
                          {q.type === 'match_following' && q.matchingPairs && (
                            <div className="space-y-1 pt-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Matching Pairs:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {q.matchingPairs.map((pair, pIdx) => (
                                  <div
                                    key={pair.id || pIdx}
                                    className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                                  >
                                    <span className="font-semibold text-slate-800">
                                      {pair.leftText}
                                    </span>
                                    <span className="text-slate-400">➔</span>
                                    <span className="font-bold text-blue-700">
                                      {pair.rightText}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Fill in the blanks preview */}
                          {q.type === 'fill_in_blanks' && q.blankSlots && (
                            <div className="space-y-1 pt-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Blank Answers:
                              </span>
                              <div className="flex items-center gap-2 flex-wrap">
                                {q.blankSlots.map((slot) => (
                                  <span
                                    key={slot.id}
                                    className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-[11px]"
                                  >
                                    {slot.label}: {slot.correctAnswer}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Step Ordering preview */}
                          {q.type === 'step_ordering' && q.orderedSteps && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] font-bold text-indigo-800 uppercase">
                                Ordered Solution Sequence:
                              </span>
                              <div className="space-y-1">
                                {q.orderedSteps.map((st, stIdx) => (
                                  <div
                                    key={stIdx}
                                    className="p-1.5 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-center gap-2 text-xs"
                                  >
                                    <span className="w-4 h-4 rounded bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                                      {stIdx + 1}
                                    </span>
                                    <span className="text-slate-800 font-medium">{st}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Interactive Student Preview */}
      {previewAssessment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900">
            {/* Header */}
            <div className="p-4 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl shadow-md">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Preview Interactive Student Experience
                  </h3>
                  <p className="text-xs text-slate-300">
                    {previewAssessment.title} • {previewAssessment.subject}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewAssessment(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
                ℹ️ This is a preview mode demonstrating how questions (MCQ, MMCQ, Fill in blanks, Match the following) will render for connected students in the live online class.
              </div>

              <div className="space-y-5">
                {previewAssessment.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">Question {idx + 1}</span>
                        {renderQuestionTypeBadge(q.type)}
                      </div>
                      <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                        {q.marks} Marks
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-900">{q.prompt}</p>

                    {/* MCQ Options */}
                    {q.type === 'mcq' && q.options && (
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-3 cursor-pointer hover:border-blue-400 transition-all text-xs font-medium text-slate-800"
                          >
                            <input type="radio" name={`prev-q-${q.id}`} className="w-4 h-4 text-blue-600" />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* MMCQ Options */}
                    {q.type === 'mmcq' && q.options && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-purple-700 uppercase">
                          ☑️ Select all that apply (Multiple choices possible):
                        </span>
                        {q.options.map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-3 cursor-pointer hover:border-purple-400 transition-all text-xs font-medium text-slate-800"
                          >
                            <input type="checkbox" className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500" />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Fill in Blanks */}
                    {q.type === 'fill_in_blanks' && q.blankSlots && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          {q.blankSlots.map((slot) => (
                            <div key={slot.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-slate-800">{slot.sentencePrefix}</span>
                              <input
                                type="text"
                                placeholder={`[Type ${slot.label}]`}
                                className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900 w-36 text-center"
                              />
                              {slot.sentenceSuffix && (
                                <span className="font-medium text-slate-800">{slot.sentenceSuffix}</span>
                              )}
                            </div>
                          ))}
                        </div>

                        {q.blankOptions && (
                          <div className="p-2.5 bg-slate-100 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                              Word Bank Options Pool:
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {q.blankOptions.map((w, wIdx) => (
                                <span
                                  key={wIdx}
                                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 shadow-xs cursor-pointer"
                                >
                                  {w}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Match the Following */}
                    {q.type === 'match_following' && q.matchingPairs && (
                      <div className="space-y-2">
                        {q.matchingPairs.map((pair, pIdx) => (
                          <div
                            key={pIdx}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-white rounded-xl border border-slate-200 items-center text-xs"
                          >
                            <span className="font-bold text-slate-800 px-2">{pair.leftText}</span>
                            <select className="px-2.5 py-1.5 bg-blue-50 border border-blue-300 rounded-lg font-semibold text-blue-900 focus:outline-none">
                              <option value="">Select Matching Option...</option>
                              {q.matchingPairs?.map((m) => (
                                <option key={m.id} value={m.rightText}>
                                  {m.rightText}
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Step Ordering */}
                    {q.type === 'step_ordering' && q.orderedSteps && (
                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2">
                          <span className="text-[11px] font-bold text-indigo-900 block">
                            📝 Arrange Solution Steps in Logical Order:
                          </span>
                          <div className="space-y-1.5">
                            {q.orderedSteps.map((step, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-2 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-center gap-2 text-xs text-slate-800"
                              >
                                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                                  {sIdx + 1}
                                </span>
                                <span className="font-medium">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {q.distractorSteps && q.distractorSteps.length > 0 && (
                          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                            <span className="font-bold text-amber-900 block mb-1">
                              ⚠️ Distractor Steps (Mixed into pool to challenge students):
                            </span>
                            <ul className="list-disc list-inside text-amber-800 text-[11px] space-y-0.5">
                              {q.distractorSteps.map((d, dIdx) => (
                                <li key={dIdx}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setPreviewAssessment(null)}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>

              <button
                onClick={() => {
                  const target = previewAssessment;
                  setPreviewAssessment(null);
                  handleDirectLaunch(target);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Share this Assessment Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Select Online Class Target to Share */}
      {launchModalAssessment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Broadcast Assessment to Online Class
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select target virtual classroom to dispatch interactive quiz
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLaunchModalAssessment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <span className="font-extrabold text-slate-900">{launchModalAssessment.title}</span>
              <p className="text-slate-500">
                {launchModalAssessment.subject} • {launchModalAssessment.questions.length} Questions • {launchModalAssessment.totalMarks} Marks
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Online Class Session
              </label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {onlineClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.title} ({cls.subject} • {cls.class} • {cls.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setLaunchModalAssessment(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmLaunchInClass}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Launch & Enter Classroom</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
