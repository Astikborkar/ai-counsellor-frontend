'use client';

import RouteGuard from "../components/RouteGuard";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import {
  CheckCircle,
  Circle,
  Target,
  Plus,
  Filter,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  AlertCircle,
  CheckSquare,
  FileText,
  BookOpen,
  Users,
  ChevronRight,
  Trash2,
  Edit3,
  Star,
  Zap,
  Lock,
  ArrowRight
} from "lucide-react";

type Task = {
  id: number;
  title: string;
  description: string;
  done: boolean;
  priority: "high" | "medium" | "low";
  category: string;
  deadline: string;
  timeEstimate: string;
  universityName?: string;
};

export default function TasksPage() {
  const { token } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [lockedUniversities, setLockedUniversities] = useState<any[]>([]);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "Documents",
    priority: "medium"
  });

  const [filter, setFilter] = useState("all"); // all, pending, completed
  const [priorityFilter, setPriorityFilter] = useState("all"); // all, high, medium, low

  // Fetch locked universities and generate tasks
  // Fetch locked universities and tasks
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        // 1. Fetch Locked Universities
        const uniRes = await fetch("https://ai-counsellor-backend-jyfb.onrender.com/universities/shortlist", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (uniRes.ok) {
          const list = await uniRes.json();
          const locked = list.filter((u: any) => u.isLocked);
          setLockedUniversities(locked);
        }

        // 2. Fetch Tasks
        const tasksRes = await fetch("https://ai-counsellor-backend-jyfb.onrender.com/tasks", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (tasksRes.ok) {
          const data = await tasksRes.json();
          setTasks(data);
        }

      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);


  const toggleTask = (id: number) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now(), // Use timestamp for unique ID
      title: newTask.title,
      description: newTask.description,
      done: false,
      priority: newTask.priority as "high" | "medium" | "low",
      category: newTask.category,
      deadline: "2025-01-01",
      timeEstimate: "1 hour"
    };

    setTasks([...tasks, task]);
    setNewTask({ title: "", description: "", category: "Documents", priority: "medium" });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Documents": return <FileText size={16} />;
      case "Exams": return <BookOpen size={16} />;
      case "Research": return <Target size={16} />;
      case "Funding": return <Award size={16} />;
      case "Applications": return <CheckSquare size={16} />;
      default: return <CheckSquare size={16} />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "pending" && task.done) return false;
    if (filter === "completed" && !task.done) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    return true;
  });

  const pendingTasks = tasks.filter(t => !t.done).length;
  const completedTasks = tasks.filter(t => t.done).length;
  const highPriorityTasks = tasks.filter(t => t.priority === "high" && !t.done).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // EMPTY STATE: No Locked Universities
  if (lockedUniversities.length === 0) {
    return (
      <RouteGuard requireLogin>
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 sm:px-6 py-8 flex items-center justify-center">
          <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={40} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Guide Locked</h1>
            <p className="text-gray-600 mb-8 text-lg">
              You haven't locked any universities yet. Please go to the Discovery page, shortlist a university, and <strong>Lock</strong> it to generate your personalized application checklist.
            </p>
            <Link href="/counsellor">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto">
                Go to Discovery
                <ArrowRight size={20} />
              </button>
            </Link>
          </div>
        </main>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard requireLogin>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Application Tasks</h1>
                <p className="text-gray-700 mt-2 font-medium">
                  Guidance for {lockedUniversities.length} Locked Universit{lockedUniversities.length > 1 ? 'ies' : 'y'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold">
                  <span>{pendingTasks} tasks pending</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-700">Total Tasks</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{tasks.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Target className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-700">Completed</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{completedTasks}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-700">High Priority</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{highPriorityTasks}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertCircle className="text-red-600" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Task List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                {/* Header with Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Zap className="text-blue-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-900">Your Tasks</h2>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {/* Filter Buttons */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => setFilter("all")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${filter === "all"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-700 hover:text-gray-900"
                          }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilter("pending")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${filter === "pending"
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:text-blue-700"
                          }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => setFilter("completed")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${filter === "completed"
                          ? "bg-green-100 text-green-700"
                          : "text-gray-700 hover:text-green-700"
                          }`}
                      >
                        Done
                      </button>
                    </div>

                    {/* Priority Filter */}
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="border-2 border-gray-300 rounded-xl px-3 py-1.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                </div>

                {/* Task List */}
                <div className="space-y-4">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-gray-400" size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No tasks found</h3>
                      <p className="text-gray-600">Try changing your filters or add a new task</p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${task.done
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                          }`}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="flex-shrink-0 mt-1"
                        >
                          {task.done ? (
                            <CheckCircle className="text-green-500" size={24} />
                          ) : (
                            <Circle className="text-gray-600" size={24} />
                          )}
                        </button>

                        {/* Task Details */}
                        <div className="flex-grow">
                          <div className="flex items-start justify-between">
                            <div>
                              {task.universityName && (
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1 block">
                                  {task.universityName}
                                </span>
                              )}
                              <h3 className={`font-bold text-lg ${task.done ? 'text-gray-500 line-through' : 'text-gray-900'
                                }`}>
                                {task.title}
                              </h3>
                              <p className="text-gray-700 mt-1 text-sm">{task.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(task.priority)}`}>
                                {task.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Task Meta */}
                          <div className="flex flex-wrap items-center gap-4 mt-3">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(task.category)}
                                <span className="font-medium">{task.category}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Calendar size={14} />
                              <span className="font-medium">Due: {task.deadline}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Clock size={14} />
                              <span className="font-medium">{task.timeEstimate}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {!task.done && (
                            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                              <Edit3 size={16} className="text-gray-600" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">Overall Progress</span>
                    <span className="font-bold text-gray-900">{tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700 mt-2">
                    <span>{completedTasks} completed</span>
                    <span>{pendingTasks} remaining</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Add Task & Tips */}
            <div className="space-y-8">
              {/* Add Task Form */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Plus className="text-blue-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">Add New Task</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="e.g., Submit UC Berkeley application"
                      className="w-full border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Add details about this task..."
                      className="w-full border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Category
                      </label>
                      <select
                        value={newTask.category}
                        onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                        className="w-full border-2 border-gray-300 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      >
                        <option value="Documents">Documents</option>
                        <option value="Exams">Exams</option>
                        <option value="Research">Research</option>
                        <option value="Funding">Funding</option>
                        <option value="Applications">Applications</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Priority
                      </label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        className="w-full border-2 border-gray-300 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={addTask}
                    disabled={!newTask.title.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Task
                  </button>
                </div>
              </div>

              {/* Tips & Suggestions */}
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="text-yellow-300" size={24} />
                  <h2 className="text-xl font-bold">AI Suggestions</h2>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <h4 className="font-bold mb-2">Prioritize High-Impact Tasks</h4>
                    <p className="text-sm text-blue-100">Focus on SOP and exam preparation first</p>
                  </div>

                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <h4 className="font-bold mb-2">Set Realistic Deadlines</h4>
                    <p className="text-sm text-blue-100">Break large tasks into smaller weekly goals</p>
                  </div>

                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <h4 className="font-bold mb-2">Track Progress Daily</h4>
                    <p className="text-sm text-blue-100">Review tasks daily to stay on schedule</p>
                  </div>
                </div>

                <button className="w-full mt-6 p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors font-bold flex items-center justify-center gap-2">
                  <TrendingUp size={16} />
                  View Detailed Plan
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full p-3 border-2 border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center gap-3">
                    <FileText className="text-blue-600" size={20} />
                    <span className="font-bold text-gray-900">Generate Task Template</span>
                  </button>
                  <button className="w-full p-3 border-2 border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors flex items-center gap-3">
                    <Users className="text-green-600" size={20} />
                    <span className="font-bold text-gray-900">Share Task List</span>
                  </button>
                  <button className="w-full p-3 border-2 border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center gap-3">
                    <Award className="text-purple-600" size={20} />
                    <span className="font-bold text-gray-900">View Achievement</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </RouteGuard>
  );
}