'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Building2,
  CheckCircle,
  Circle,
  Edit3,
  ChevronRight,
  GraduationCap,
  Globe,
  DollarSign,
  Calendar,
  TrendingUp,
  Target,
  BookOpen,
  FileText,
  MessageSquare,
  Search,
  Clock,
  Users,
  Award,
  Plus,
  X
} from "lucide-react";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState(1);
  const { token } = useAuthStore();
  const completeProfile = useAuthStore((s) => s.completeProfile);
  const [tasks, setTasks] = useState([
    { id: 1, title: "Complete SOP Draft", done: false },
    { id: 2, title: "Book IELTS Exam", done: false },
  ]);

  // Missing state restored
  const [newTask, setNewTask] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [profileStrength, setProfileStrength] = useState({
    academics: 0,
    exams: 0,
    sop: 0
  });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setLoading(false);
        // Optional: redirect to login if you want to enforce it here
        // window.location.href = '/login'; 
        return;
      }
      try {
        const [profileRes, shortlistRes] = await Promise.all([
          fetch("https://ai-counsellor-backend-jyfb.onrender.com/profile", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("https://ai-counsellor-backend-jyfb.onrender.com/universities/shortlist", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          completeProfile(); // Sync store with backend state

          // Set initial profile strength based on data
          setProfileStrength({
            academics: 85, // Placeholder/Derived
            exams: profileData.exams?.examStatus === 'completed' ? 100 : 40,
            sop: profileData.exams?.sopStatus === 'finalized' ? 100 : 20
          });
        }
        if (shortlistRes.ok) {
          const list = await shortlistRes.json();
          setShortlist(list);
          if (list.some((u: any) => u.isLocked)) {
            setStage(4); // Locked -> Preparing Applications
          } else if (list.length > 0) {
            setStage(2); // Shortlisted -> Discovering/Finalizing
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ));

    // Update profile strength when tasks are completed
    const task = tasks.find(t => t.id === id);
    if (task) {
      if (task.title.includes("SOP") && !task.done) {
        setProfileStrength(prev => ({ ...prev, sop: Math.min(prev.sop + 20, 100) }));
      }
      if (task.title.includes("IELTS") && !task.done) {
        setProfileStrength(prev => ({ ...prev, exams: Math.min(prev.exams + 30, 100) }));
      }
    }
  };

  const addNewTask = () => {
    if (newTask.trim() === "") return;

    const newTaskObj = {
      id: tasks.length + 1,
      title: newTask,
      done: false
    };

    setTasks([...tasks, newTaskObj]);
    setNewTask("");
    setShowAddTask(false);
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleStageChange = (newStage: number) => {
    setStage(newStage);

    // Add a task when moving to next stage
    if (newStage > stage) {
      const stageTasks = [
        "Review your profile information",
        "Explore recommended universities",
        "Schedule a consultation call",
        "Start preparing application documents"
      ];

      if (newStage <= stageTasks.length) {
        const newTaskObj = {
          id: tasks.length + 1,
          title: `Stage ${newStage}: ${stageTasks[newStage - 1]}`,
          done: false
        };
        setTasks([...tasks, newTaskObj]);
      }
    }
  };

  const improveProfileStrength = () => {
    setProfileStrength({
      academics: Math.min(profileStrength.academics + 5, 100),
      exams: Math.min(profileStrength.exams + 15, 100),
      sop: Math.min(profileStrength.sop + 10, 100)
    });

    // Add improvement tasks
    const improvementTask = {
      id: tasks.length + 1,
      title: "Review profile improvement suggestions",
      done: false
    };
    setTasks([...tasks, improvementTask]);
  };

  const stageText = () => {
    switch (stage) {
      case 1: return "Building Profile";
      case 2: return "Discovering Universities";
      case 3: return "Finalizing Universities";
      default: return "Preparing Applications";
    }
  };

  const stageDescriptions: any = {
    1: "Set up your academic profile and preferences",
    2: "Find universities matching your profile",
    3: "Narrow down your final university choices",
    4: "Prepare and submit applications"
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-700 mt-2 font-medium">Your study-abroad control center</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <span className="text-sm font-bold text-gray-800">
                Welcome back, <span className="text-blue-700">  ...</span>
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-bold text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Stage Progress Bar */}
        <div className="mb-10 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Current Stage</h2>
              <p className="text-gray-700 mt-1 font-medium">{stageDescriptions[stage]}</p>
            </div>
            <div className="px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
              <span className="text-blue-700 font-bold">Stage {stage}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{stageText()}</h3>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(stage / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                onClick={() => handleStageChange(n)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${stage === n
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${stage === n ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                  {n}
                </div>
                <span className={`text-sm font-bold ${stage === n ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                  Stage {n}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Link href="/chat" className="w-full">
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <MessageSquare size={20} />
                Open AI Counsellor Chat
                <ChevronRight size={20} />
              </button>
            </Link>

            <Link href="/counsellor" className="w-full">
              <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                <Search size={20} />
                Discover Universities
                <ChevronRight size={20} />
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Profile Summary Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Profile Summary</h2>
                  <Link href="/onboarding" className="flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors font-bold">
                    <Edit3 size={16} />
                    <span>Edit</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <GraduationCap className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Education</p>
                        <p className="font-bold text-gray-900">{profile?.academic?.degree || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Target Intake</p>
                        <p className="font-bold text-gray-900">{profile?.goal?.intakeSeason} {profile?.goal?.intakeYear}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Globe className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Target Countries</p>
                        <p className="font-bold text-gray-900">{profile?.goal?.countries?.join(", ") || "Any"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <DollarSign className="text-amber-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Budget</p>
                        <p className="font-bold text-gray-900">${profile?.budget?.min} - ${profile?.budget?.max}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Award className="text-blue-500" size={16} />
                      <span className="text-lg font-bold text-gray-900">3.8</span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium">GPA</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="text-green-500" size={16} />
                      <span className="text-lg font-bold text-gray-900">85%</span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium">Profile Match</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="text-purple-500" size={16} />
                      <span className="text-lg font-bold text-gray-900">12</span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium">Universities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Target className="text-blue-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">AI To-Do List</h2>
                </div>
                <span className="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-bold text-gray-800">
                  {tasks.filter(t => t.done).length}/{tasks.length} completed
                </span>
              </div>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${task.done
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                      }`}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0"
                      aria-label={task.done ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {task.done ? (
                        <CheckCircle className="text-green-500 hover:text-green-600" size={24} />
                      ) : (
                        <Circle className="text-gray-600 hover:text-blue-600" size={24} />
                      )}
                    </button>
                    <span className={`font-bold flex-grow ${task.done ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                      {task.title}
                    </span>
                    {!task.done ? (
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                        Pending
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                        Done
                      </span>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Delete task"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Task */}
              {showAddTask ? (
                <div className="mt-4 p-4 border-2 border-blue-300 bg-blue-50 rounded-xl">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="Enter new task..."
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && addNewTask()}
                    />
                    <button
                      onClick={addNewTask}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setShowAddTask(false);
                        setNewTask("");
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddTask(true)}
                  className="w-full mt-4 p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-700">
                    <Plus size={20} />
                    <span className="font-bold">Add New Task</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Profile Strength */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Profile Strength</h2>
              </div>

              <div className="space-y-6">
                {/* Academics */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="text-blue-600" size={16} />
                      </div>
                      <span className="font-bold text-gray-900">Academics</span>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${profileStrength.academics >= 80
                      ? 'bg-green-100 text-green-800'
                      : profileStrength.academics >= 50
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {profileStrength.academics >= 80 ? 'Strong' :
                        profileStrength.academics >= 50 ? 'Moderate' : 'Weak'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${profileStrength.academics >= 80 ? 'bg-green-500' :
                        profileStrength.academics >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${profileStrength.academics}%` }}
                    ></div>
                  </div>
                </div>

                {/* Exams */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Target className="text-purple-600" size={16} />
                      </div>
                      <span className="font-bold text-gray-900">Exams</span>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${profileStrength.exams >= 80
                      ? 'bg-green-100 text-green-800'
                      : profileStrength.exams >= 50
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {profileStrength.exams >= 80 ? 'Completed' :
                        profileStrength.exams >= 50 ? 'In Progress' : 'Not Started'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${profileStrength.exams >= 80 ? 'bg-green-500' :
                        profileStrength.exams >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${profileStrength.exams}%` }}
                    ></div>
                  </div>
                </div>

                {/* SOP */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <FileText className="text-amber-600" size={16} />
                      </div>
                      <span className="font-bold text-gray-900">SOP & Documents</span>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${profileStrength.sop >= 80
                      ? 'bg-green-100 text-green-800'
                      : profileStrength.sop >= 50
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {profileStrength.sop >= 80 ? 'Completed' :
                        profileStrength.sop >= 50 ? 'In Progress' : 'Not Started'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${profileStrength.sop >= 80 ? 'bg-green-500' :
                        profileStrength.sop >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${profileStrength.sop}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <p className="text-sm text-gray-900 font-bold">
                  <span className="text-blue-700">Tip:</span> Complete your SOP draft and book exams to improve your profile strength.
                </p>
              </div>

              {/* Improve Profile Button */}
              <button
                onClick={improveProfileStrength}
                className="w-full mt-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 transition-all"
              >
                <div className="flex items-center justify-center gap-2 text-blue-700 font-bold">
                  <span>View Detailed Analysis</span>
                  <ChevronRight size={16} />
                </div>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Building2 size={24} />
                Quick Stats
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="text-3xl font-bold mb-2">12</div>
                  <p className="text-blue-100 text-sm font-bold">Universities Shortlisted</p>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="text-3xl font-bold mb-2">5</div>
                  <p className="text-blue-100 text-sm font-bold">Deadlines This Month</p>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer">
                  <div className="text-3xl font-bold mb-2">85%</div>
                  <p className="text-blue-100 text-sm font-bold">Profile Match</p>
                </div>
                <Link href="/tasks">
                  <div className="text-center p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer">
                    <div className="text-3xl font-bold mb-2">{tasks.filter(t => !t.done).length}</div>
                    <p className="text-blue-100 text-sm font-bold">Active Tasks</p>
                  </div>
                </Link>
              </div>

              {/* Recent Activity */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <h3 className="font-bold mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-blue-100">Updated profile information</span>
                    <span className="text-white/70 ml-auto">2h ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-100">Viewed university recommendations</span>
                    <span className="text-white/70 ml-auto">1d ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-blue-100">Completed LOR request</span>
                    <span className="text-white/70 ml-auto">2d ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Upcoming Deadlines</h2>
            </div>
            <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-bold">
              3 Urgent
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-red-200 bg-red-50 rounded-xl hover:bg-red-100 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">Stanford University</span>
                <span className="text-sm font-bold text-red-700">Dec 15</span>
              </div>
              <p className="text-sm text-gray-700">MSCS Application</p>
            </div>

            <div className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">MIT</span>
                <span className="text-sm font-bold text-yellow-700">Jan 5</span>
              </div>
              <p className="text-sm text-gray-700">PhD Application</p>
            </div>

            <div className="p-4 border-2 border-green-200 bg-green-50 rounded-xl hover:bg-green-100 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">University of Toronto</span>
                <span className="text-sm font-bold text-green-700">Feb 1</span>
              </div>
              <p className="text-sm text-gray-700">Masters Application</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}