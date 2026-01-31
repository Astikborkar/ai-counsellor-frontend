'use client';

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Star,
  Users,
  Award,
  Globe,
  BookOpen,
  TrendingUp,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Target,
  Eye,
  Share2,
  Download,
  Calendar,
  Lock,
  Unlock
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

type University = {
  id: number;
  name: string;
  location: string;
  country: string;
  ranking: string;
  acceptanceRate: string;
  tuition: string;
  popularPrograms: string[];
  matchScore: number;
  deadline: string;
  requirements: string[];
  isLocked?: boolean;
  saved?: boolean;
};

export default function UniversitiesPage() {
  const { token } = useAuthStore();
  const [universities, setUniversities] = useState<University[]>([
    // ... (Keep existing data for now as "database")
    {
      id: 1,
      name: "Stanford University",
      location: "Stanford, California",
      country: "United States",
      ranking: "#3 in Computer Science",
      acceptanceRate: "4%",
      tuition: "$56,000",
      popularPrograms: ["MSCS", "MBA", "Engineering"],
      matchScore: 92,
      saved: false, // Default false, will fetch from API
      isLocked: false,
      deadline: "Dec 15, 2024",
      requirements: ["GRE: 320+", "GPA: 3.8+", "IELTS: 7.5+"]
    },
    // ... (I will keep the rest of the array locally for demo purposes but reset saved to false)
    // ... (Abbreviated for brevity in this prompt, will handle in logic)

    {
      id: 2,
      name: "University of Toronto",
      location: "Toronto, Ontario",
      country: "Canada",
      ranking: "#1 in Canada",
      acceptanceRate: "43%",
      tuition: "$45,000",
      popularPrograms: ["Computer Science", "Business", "Medicine"],
      matchScore: 88,
      saved: false,
      deadline: "Jan 15, 2025",
      requirements: ["GPA: 3.5+", "IELTS: 7.0+", "LOR: 3"]
    },
    {
      id: 3,
      name: "Carnegie Mellon University",
      location: "Pittsburgh, Pennsylvania",
      country: "United States",
      ranking: "#1 in Computer Science",
      acceptanceRate: "17%",
      tuition: "$58,000",
      popularPrograms: ["AI", "Robotics", "Software Engineering"],
      matchScore: 85,
      saved: false,
      deadline: "Dec 31, 2024",
      requirements: ["GRE: 325+", "GPA: 3.7+", "Strong SOP"]
    },
    {
      id: 4,
      name: "University of British Columbia",
      location: "Vancouver, British Columbia",
      country: "Canada",
      ranking: "#2 in Canada",
      acceptanceRate: "52%",
      tuition: "$38,000",
      popularPrograms: ["Data Science", "Business", "Environmental Science"],
      matchScore: 82,
      saved: false,
      deadline: "Feb 1, 2025",
      requirements: ["GPA: 3.4+", "IELTS: 6.5+", "Personal Profile"]
    },
    {
      id: 5,
      name: "University of California, Berkeley",
      location: "Berkeley, California",
      country: "United States",
      ranking: "#2 in Computer Science",
      acceptanceRate: "11%",
      tuition: "$54,000",
      popularPrograms: ["EECS", "Business", "Law"],
      matchScore: 79,
      saved: false,
      deadline: "Dec 15, 2024",
      requirements: ["GRE: 320+", "GPA: 3.6+", "Research Experience"]
    },
    {
      id: 6,
      name: "University of Waterloo",
      location: "Waterloo, Ontario",
      country: "Canada",
      ranking: "#3 in Canada",
      acceptanceRate: "53%",
      tuition: "$42,000",
      popularPrograms: ["Computer Science", "Engineering", "Math"],
      matchScore: 76,
      saved: false,
      deadline: "Jan 31, 2025",
      requirements: ["GPA: 3.3+", "IELTS: 6.5+", "Co-op Experience"]
    },
    {
      id: 7,
      name: "Massachusetts Institute of Technology",
      location: "Cambridge, Massachusetts",
      country: "United States",
      ranking: "#1 in Engineering",
      acceptanceRate: "7%",
      tuition: "$53,000",
      popularPrograms: ["Computer Science", "Engineering", "Physics"],
      matchScore: 74,
      saved: false,
      deadline: "Dec 1, 2024",
      requirements: ["GRE: 330+", "GPA: 3.9+", "Research Papers"]
    },
    {
      id: 8,
      name: "McGill University",
      location: "Montreal, Quebec",
      country: "Canada",
      ranking: "#4 in Canada",
      acceptanceRate: "46%",
      tuition: "$36,000",
      popularPrograms: ["Medicine", "Law", "Computer Science"],
      matchScore: 71,
      saved: false,
      deadline: "Jan 15, 2025",
      requirements: ["GPA: 3.4+", "IELTS: 6.5+", "French Proficiency"]
    },
  ]); // End of big state

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedMatch, setSelectedMatch] = useState("all");
  const [sortBy, setSortBy] = useState("match");
  const [savedOnly, setSavedOnly] = useState(false);

  // FETCH SHORTLIST ON MOUNT
  useEffect(() => {
    if (!token) return;
    const fetchShortlist = async () => {
      try {
        const res = await fetch("https://ai-counsellor-backend-jyfb.onrender.com/universities/shortlist", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const shortlist = await res.json();
          // Update local state based on fetched shortlist
          // Note: Real app would fetch universities from DB, here we just sync 'saved' status
          const shortlistedNames = new Set(shortlist.map((item: any) => item.universityName));
          const lockedNames = new Set(shortlist.filter((item: any) => item.isLocked).map((item: any) => item.universityName));

          setUniversities(prev => prev.map(u => ({
            ...u,
            saved: shortlistedNames.has(u.name),
            isLocked: lockedNames.has(u.name)
          })));
        }
      } catch (err) {
        console.error("Failed to fetch shortlist", err);
      }
    };
    fetchShortlist();
  }, [token]);


  const toggleSave = async (university: University) => {
    if (!token) {
      alert("Please login to shortlist universities");
      return;
    }

    // Optimistic Update
    setUniversities(universities.map(univ =>
      univ.id === university.id ? { ...univ, saved: !univ.saved } : univ
    ));

    try {
      if (!university.saved) {
        // Add to shortlist
        await fetch("https://ai-counsellor-backend-jyfb.onrender.com/universities/shortlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            universityName: university.name,
            universityId: university.id.toString(),
            location: university.location,
            category: "Target", // Default
          })
        });
      } else {
        // Remove from shortlist - We need the DB ID, but for this demo we delete by name/ID logic or need to fetch ID first.
        // Simplified: The backend delete endpoint expects an ID (primary key of Shortlist).
        // Since we don't have that easily here without more state, we might hit an issue.
        // HACK: For now let's assume valid delete needs fetching.
        // actually let's re-fetch shortlist to be safe or ignore delete error for prototype.
        // Improve: fetch shortlist to find the entry ID for this university.
        const res = await fetch("https://ai-counsellor-backend-jyfb.onrender.com/universities/shortlist", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const list = await res.json();
        const item = list.find((i: any) => i.universityName === university.name);
        if (item) {
          await fetch(`https://ai-counsellor-backend-jyfb.onrender.com/universities/shortlist/${item.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }
    } catch (err) {
      console.error("Error toggling save", err);
      // Revert on error
      setUniversities(universities.map(univ =>
        univ.id === university.id ? { ...univ, saved: university.saved } : univ
      ));
    }
  };

  const toggleLock = async (university: University) => {
    if (!token) return;
    if (!university.saved) {
      alert("You must shortlist a university before locking it.");
      return;
    }

    // Find shortlist ID
    try {
      const res = await fetch("https://ai-counsellor-backend-jyfb.onrender.com/universities/shortlist", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const list = await res.json();
      const item = list.find((i: any) => i.universityName === university.name);

      if (item) {
        const lockRes = await fetch(`https://ai-counsellor-backend-jyfb.onrender.com/universities/lock/${item.id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });

        if (lockRes.ok) {
          setUniversities(universities.map(univ =>
            univ.id === university.id ? { ...univ, isLocked: true } : univ
          ));
        }
      }
    } catch (err) {
      console.error("Lock error", err);
    }
  };

  const countries = ["United States", "Canada", "United Kingdom", "Australia", "Germany", "All"];

  const filteredUniversities = universities.filter(university => {
    if (savedOnly && !university.saved) return false;
    if (selectedCountry !== "all" && university.country !== selectedCountry) return false;
    if (selectedMatch !== "all") {
      const minScore = parseInt(selectedMatch);
      if (university.matchScore < minScore) return false;
    }
    if (searchTerm && !university.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !university.location.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const sortedUniversities = [...filteredUniversities].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "tuition":
        return parseInt(a.tuition.replace(/[^0-9]/g, '')) - parseInt(b.tuition.replace(/[^0-9]/g, ''));
      case "deadline":
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      default: // match
        return b.matchScore - a.matchScore;
    }
  });

  const savedCount = universities.filter(u => u.saved).length;
  const matchStats = {
    excellent: universities.filter(u => u.matchScore >= 85).length,
    good: universities.filter(u => u.matchScore >= 70 && u.matchScore < 85).length,
    moderate: universities.filter(u => u.matchScore >= 60 && u.matchScore < 70).length,
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 sm:px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Discover Universities</h1>
              <p className="text-gray-700 mt-2 font-medium">Find your perfect study abroad destination</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold">
                <span>{universities.length} universities</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700">Saved Universities</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{savedCount}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookmarkCheck className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700">Excellent Match</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{matchStats.excellent}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700">Good Match</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{matchStats.good}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700">Application Deadlines</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">4</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <Calendar className="text-red-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <Filter className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Search Universities
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={20} />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or location..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                </div>
              </div>

              {/* Country Filter */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Country
                </label>
                <div className="space-y-2">
                  {countries.map((country) => (
                    <button
                      key={country}
                      onClick={() => setSelectedCountry(country === "All" ? "all" : country)}
                      className={`w-full flex items-center gap-2 p-3 rounded-xl border-2 transition-all font-medium ${(country === "All" && selectedCountry === "all") ||
                        selectedCountry === country
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700'
                        }`}
                    >
                      <Globe size={16} />
                      <span>{country}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Match Score Filter */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Match Score
                </label>
                <div className="space-y-2">
                  {[
                    { label: "All Scores", value: "all" },
                    { label: "85%+ Excellent", value: "85" },
                    { label: "70%+ Good", value: "70" },
                    { label: "60%+ Moderate", value: "60" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedMatch(option.value)}
                      className={`w-full flex items-center gap-2 p-3 rounded-xl border-2 transition-all font-medium ${selectedMatch === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700'
                        }`}
                    >
                      <TrendingUp size={16} />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border-2 border-gray-300 bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                >
                  <option value="match">Best Match</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="tuition">Tuition (Low to High)</option>
                  <option value="deadline">Deadline (Soonest)</option>
                </select>
              </div>

              {/* Saved Only Toggle */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={savedOnly}
                    onChange={(e) => setSavedOnly(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-gray-900">Show Saved Only</span>
                    <p className="text-sm text-gray-700 mt-1">
                      View only your saved universities
                    </p>
                  </div>
                </label>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full p-3 border-2 border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center gap-3">
                    <Download className="text-blue-600" size={20} />
                    <span className="font-bold text-gray-900">Export List</span>
                  </button>
                  <button className="w-full p-3 border-2 border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors flex items-center gap-3">
                    <Share2 className="text-green-600" size={20} />
                    <span className="font-bold text-gray-900">Share List</span>
                  </button>
                  <Link href="/counsellor" className="block">
                    <button className="w-full p-3 border-2 border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center gap-3">
                      <Target className="text-purple-600" size={20} />
                      <span className="font-bold text-gray-900">Get AI Recommendations</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - University Cards */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {sortedUniversities.length} Universities Found
                </h2>
                <p className="text-gray-700 mt-1 font-medium">
                  Based on your profile and preferences
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-300">
                  <span className="text-sm font-bold text-gray-700">
                    Showing {sortedUniversities.length} of {universities.length}
                  </span>
                </div>
              </div>
            </div>

            {/* University Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedUniversities.length === 0 ? (
                <div className="col-span-2 text-center py-12 bg-white rounded-2xl shadow">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No universities found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search term</p>
                </div>
              ) : (
                sortedUniversities.map((university) => (
                  <div key={university.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    {/* University Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{university.name}</h3>
                            <div className="flex items-center gap-1">
                              {[...Array(3)].map((_, i) => (
                                <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin size={16} />
                            <span className="font-medium">{university.location}</span>
                            <span className="text-gray-400">•</span>
                            <span className="font-medium">{university.country}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleSave(university)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {university.saved ? (
                              <BookmarkCheck size={24} className="text-blue-600" />
                            ) : (
                              <Bookmark size={24} className="text-gray-400 hover:text-blue-600" />
                            )}
                          </button>
                          <button
                            onClick={() => toggleLock(university)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-1"
                            title={university.isLocked ? "Locked" : "Lock University"}
                          >
                            {university.isLocked ? (
                              <Lock size={24} className="text-red-600 fill-red-100" />
                            ) : (
                              <Unlock size={24} className="text-gray-400 hover:text-red-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">Match Score</span>
                          <span className={`font-bold ${university.matchScore >= 85 ? 'text-green-600' :
                            university.matchScore >= 70 ? 'text-yellow-600' :
                              'text-orange-600'
                            }`}>
                            {university.matchScore}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${university.matchScore >= 85 ? 'bg-green-500' :
                              university.matchScore >= 70 ? 'bg-yellow-500' :
                                'bg-orange-500'
                              }`}
                            style={{ width: `${university.matchScore}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <Award size={16} className="text-blue-600" />
                            <span className="text-sm font-bold text-gray-900">Ranking</span>
                          </div>
                          <p className="text-sm text-gray-700">{university.ranking}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <Users size={16} className="text-green-600" />
                            <span className="text-sm font-bold text-gray-900">Acceptance</span>
                          </div>
                          <p className="text-sm text-gray-700">{university.acceptanceRate}</p>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign size={16} className="text-amber-600" />
                            <span className="text-sm font-bold text-gray-900">Tuition</span>
                          </div>
                          <p className="text-sm text-gray-700">{university.tuition}/year</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={16} className="text-purple-600" />
                            <span className="text-sm font-bold text-gray-900">Deadline</span>
                          </div>
                          <p className="text-sm text-gray-700">{university.deadline}</p>
                        </div>
                      </div>

                      {/* Popular Programs */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen size={16} className="text-gray-600" />
                          <span className="font-bold text-gray-900">Popular Programs</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {university.popularPrograms.map((program, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                              {program}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Requirements */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Target size={16} className="text-gray-600" />
                          <span className="font-bold text-gray-900">Key Requirements</span>
                        </div>
                        <ul className="space-y-1">
                          {university.requirements.slice(0, 3).map((req, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                          <Eye size={20} />
                          View Details
                        </button>
                        <Link href="/chat" className="flex-1">
                          <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                            <Target size={20} />
                            Ask AI
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination/Load More */}
            {sortedUniversities.length > 0 && (
              <div className="mt-8 text-center">
                <button className="px-8 py-3 border-2 border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors font-bold text-gray-900">
                  Load More Universities
                </button>
              </div>
            )}

            {/* AI Recommendation */}
            <div className="mt-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {/*<Bot size={24} />*/}
                    <h3 className="text-xl font-bold">Need Personalized Recommendations?</h3>
                  </div>
                  <p className="text-blue-100">
                    Our AI can analyze your profile and suggest the best universities for you
                  </p>
                </div>
                <Link href="/chat">
                  <button className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold transition-colors shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap">
                    <Target size={20} />
                    Get AI Recommendations
                    <ChevronRight size={20} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main >
  );
}