'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  GraduationCap,
  Target,
  DollarSign,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Globe,
  Calendar,
  Award,
  BookOpen,
  Clock,
  ChevronRight,
  MapPin,
  User
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const completeProfile = useAuthStore((s) => s.completeProfile);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Form states
  const [academic, setAcademic] = useState({
    educationLevel: "",
    degree: "",
    major: "",
    university: "",
    graduationYear: "",
    gpa: "",
    specialization: "",
  });

  const [goals, setGoals] = useState({
    targetDegree: "",
    fieldOfInterest: "",
    specialization: "",
    intakeYear: "",
    intakeSeason: "Fall",
    countries: [] as string[],
    preferredCities: "",
  });

  const [budget, setBudget] = useState({
    min: "",
    max: "",
    fundingSource: "",
    scholarshipInterest: true,
    currency: "USD",
  });

  const [exams, setExams] = useState({
    ieltsScore: "",
    toeflScore: "",
    greScore: "",
    gmatScore: "",
    examStatus: "planned",
    sopStatus: "not_started",
    lorStatus: "0",
    resumeStatus: "not_started",
  });

  // Available countries for selection
  const countryOptions = [
    "United States", "Canada", "United Kingdom", "Australia",
    "Germany", "France", "Netherlands", "Sweden", "Singapore",
    "Ireland", "New Zealand", "Switzerland"
  ];

  const validateStep = () => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!academic.educationLevel) errors.educationLevel = "Education level is required";
      if (!academic.degree) errors.degree = "Degree is required";
      if (!academic.major) errors.major = "Major is required";
      if (!academic.gpa) errors.gpa = "GPA is required";
      if (!academic.graduationYear) errors.graduationYear = "Graduation year is required";
    } else if (step === 2) {
      if (!goals.targetDegree) errors.targetDegree = "Target degree is required";
      if (!goals.fieldOfInterest) errors.fieldOfInterest = "Field of interest is required";
      if (goals.countries.length === 0) errors.countries = "Select at least one country";
      if (!goals.intakeYear) errors.intakeYear = "Intake year is required";
    } else if (step === 3) {
      if (!budget.min) errors.min = "Minimum budget is required";
      if (!budget.max) errors.max = "Maximum budget is required";
      if (!budget.fundingSource) errors.fundingSource = "Funding source is required";
      if (parseFloat(budget.min) > parseFloat(budget.max)) {
        errors.max = "Maximum budget must be greater than minimum";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCountryToggle = (country: string) => {
    setGoals(prev => {
      const newCountries = prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country];
      return { ...prev, countries: newCountries };
    });
    // Clear country error if any
    if (validationErrors.countries) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.countries;
        return newErrors;
      });
    }
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);

    const fullProfile = {
      academic,
      goal: goals, // Fix: Backend expects 'goal' (singular)
      budget,
      exams,
      profile_complete: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      console.log("Submitting profile:", fullProfile);

      // Save to backend - fixed endpoint and added auth
      const { token } = useAuthStore.getState(); // Access token directly for async function

      const response = await fetch("https://ai-counsellor-backend-jyfb.onrender.com/profile/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(fullProfile),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Profile saved successfully:", result);

      // Update local state
      completeProfile();

      // Show success message
      alert("Profile completed successfully!");

      // Redirect to dashboard
      router.push("/dashboard");

    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Progress bar calculation
  const progressPercentage = (step / 4) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 px-4 sm:px-6 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Complete Your Study Abroad Profile
          </h1>
          <p className="text-gray-700 max-w-2xl mx-auto font-medium">
            Help us personalize your experience. The more we know, the better we can assist you.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-white">
                <User size={20} />
                <span className="font-bold">Profile Setup</span>
              </div>
              <span className="text-white font-bold">Step {step} of 4</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Step Navigation */}
            <div className="grid grid-cols-4 gap-4 mb-10">
              {[
                { number: 1, label: "Academic Background", icon: GraduationCap },
                { number: 2, label: "Study Goals", icon: Target },
                { number: 3, label: "Budget & Funding", icon: DollarSign },
                { number: 4, label: "Exams & Docs", icon: FileText },
              ].map((item) => (
                <button
                  key={item.number}
                  onClick={() => setStep(item.number)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${step === item.number
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step === item.number
                    ? "bg-blue-500 text-white"
                    : step > item.number
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-600"
                    }`}>
                    {step > item.number ? (
                      <CheckCircle size={20} />
                    ) : (
                      <item.icon size={20} />
                    )}
                  </div>
                  <span className="text-xs font-bold text-center">
                    Step {item.number}
                  </span>
                  <span className="text-xs text-gray-700 text-center mt-1 font-medium">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Form Content */}
            <div className="max-w-2xl mx-auto">
              {/* Step 1: Academic Background */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <GraduationCap className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Academic Background</h2>
                      <p className="text-gray-700 font-medium">Tell us about your current education</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Education Level *
                      </label>
                      <select
                        value={academic.educationLevel}
                        onChange={(e) => {
                          setAcademic({ ...academic, educationLevel: e.target.value });
                          if (validationErrors.educationLevel) {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.educationLevel;
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full border-2 ${validationErrors.educationLevel ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium`}
                      >
                        <option value="" className="text-gray-600">Select level</option>
                        <option value="bachelors">Bachelor&apos;s Degree</option>
                        <option value="masters">Master&apos;s Degree</option>
                        <option value="phd">PhD</option>
                        <option value="diploma">Diploma</option>
                        <option value="high_school">High School</option>
                      </select>
                      {validationErrors.educationLevel && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.educationLevel}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Current Degree *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., B.Tech Computer Science"
                        value={academic.degree}
                        onChange={(e) => {
                          setAcademic({ ...academic, degree: e.target.value });
                          if (validationErrors.degree) {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.degree;
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full border-2 ${validationErrors.degree ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 placeholder-gray-600 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium`}
                      />
                      {validationErrors.degree && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.degree}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Major/Field *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Computer Science, Mechanical Engineering"
                        value={academic.major}
                        onChange={(e) => {
                          setAcademic({ ...academic, major: e.target.value });
                          if (validationErrors.major) {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.major;
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full border-2 ${validationErrors.major ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 placeholder-gray-600 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium`}
                      />
                      {validationErrors.major && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.major}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        GPA/CGPA *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 3.6/4.0 or 8.5/10"
                        value={academic.gpa}
                        onChange={(e) => {
                          setAcademic({ ...academic, gpa: e.target.value });
                          if (validationErrors.gpa) {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.gpa;
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full border-2 ${validationErrors.gpa ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 placeholder-gray-600 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium`}
                      />
                      {validationErrors.gpa && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.gpa}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Graduation Year *
                      </label>
                      <select
                        value={academic.graduationYear}
                        onChange={(e) => {
                          setAcademic({ ...academic, graduationYear: e.target.value });
                          if (validationErrors.graduationYear) {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.graduationYear;
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full border-2 ${validationErrors.graduationYear ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium`}
                      >
                        <option value="" className="text-gray-600">Select year</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      {validationErrors.graduationYear && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.graduationYear}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        University/College
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., University of Delhi"
                        value={academic.university}
                        onChange={(e) => setAcademic({ ...academic, university: e.target.value })}
                        className="w-full border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-600 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Specialization/Area of Interest
                    </label>
                    <textarea
                      placeholder="e.g., Artificial Intelligence, Data Science, Robotics, etc."
                      value={academic.specialization}
                      onChange={(e) => setAcademic({ ...academic, specialization: e.target.value })}
                      className="w-full border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-600 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Study Goals */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="text-purple-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Study Goals</h2>
                      <p className="text-gray-700 font-medium">Where and what do you want to study?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Target Degree *
                      </label>
                      <select
                        value={goals.targetDegree}
                        onChange={(e) => {
                          setGoals({ ...goals, targetDegree: e.target.value });
                          if (validationErrors.targetDegree) {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.targetDegree;
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full border-2 ${validationErrors.targetDegree ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium`}
                      >
                        <option value="" className="text-gray-600">Select degree</option>
                        <option value="bachelors">Bachelor&apos;s</option>
                        <option value="masters">Master&apos;s</option>
                        <option value="phd">PhD</option>
                        <option value="diploma">Diploma/Certificate</option>
                      </select>
                      {validationErrors.targetDegree && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.targetDegree}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Field of Interest *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Computer Science, MBA, Mechanical Engineering"
                        value={goals.fieldOfInterest}
                        onChange={(e) => {
                          setGoals({ ...goals, fieldOfInterest: e.target.value });
                          if (validationErrors.fieldOfInterest) {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.fieldOfInterest;
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full border-2 ${validationErrors.fieldOfInterest ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 placeholder-gray-600 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium`}
                      />
                      {validationErrors.fieldOfInterest && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.fieldOfInterest}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-900 mb-3">
                        Target Countries *
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {countryOptions.map((country) => (
                          <button
                            key={country}
                            type="button"
                            onClick={() => handleCountryToggle(country)}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-medium ${goals.countries.includes(country)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/50 text-gray-900'
                              }`}
                          >
                            <Globe size={14} />
                            <span className="text-sm">{country}</span>
                            {goals.countries.includes(country) && (
                              <CheckCircle size={14} className="text-green-500" />
                            )}
                          </button>
                        ))}
                      </div>
                      {validationErrors.countries && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.countries}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Intake Year *
                      </label>
                      <select
                        value={goals.intakeYear}
                        onChange={(e) => {
                          setGoals({ ...goals, intakeYear: e.target.value });
                          if (validationErrors.intakeYear) {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.intakeYear;
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full border-2 ${validationErrors.intakeYear ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium`}
                      >
                        <option value="" className="text-gray-600">Select year</option>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      {validationErrors.intakeYear && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.intakeYear}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Intake Season *
                      </label>
                      <select
                        value={goals.intakeSeason}
                        onChange={(e) => setGoals({ ...goals, intakeSeason: e.target.value })}
                        className="w-full border-2 border-gray-300 bg-white text-gray-900 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      >
                        <option value="Fall">Fall (September)</option>
                        <option value="Spring">Spring (January)</option>
                        <option value="Summer">Summer (May)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Preferred Cities/Regions
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., California, Toronto, London, etc."
                        value={goals.preferredCities}
                        onChange={(e) => setGoals({ ...goals, preferredCities: e.target.value })}
                        className="w-full border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-600 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Budget & Funding */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <DollarSign className="text-green-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Budget & Funding</h2>
                      <p className="text-gray-700 font-medium">Set your financial expectations</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Minimum Budget *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-600 font-bold">$</span>
                          </div>
                          <input
                            type="number"
                            placeholder="0"
                            value={budget.min}
                            onChange={(e) => {
                              setBudget({ ...budget, min: e.target.value });
                              if (validationErrors.min) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.min;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`w-full border-2 ${validationErrors.min ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 placeholder-gray-600 rounded-lg pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium`}
                          />
                        </div>
                        {validationErrors.min && (
                          <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.min}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Maximum Budget *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-600 font-bold">$</span>
                          </div>
                          <input
                            type="number"
                            placeholder="50000"
                            value={budget.max}
                            onChange={(e) => {
                              setBudget({ ...budget, max: e.target.value });
                              if (validationErrors.max) {
                                setValidationErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.max;
                                  return newErrors;
                                });
                              }
                            }}
                            className={`w-full border-2 ${validationErrors.max ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 placeholder-gray-600 rounded-lg pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium`}
                          />
                        </div>
                        {validationErrors.max && (
                          <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.max}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Currency
                        </label>
                        <select
                          value={budget.currency}
                          onChange={(e) => setBudget({ ...budget, currency: e.target.value })}
                          className="w-full border-2 border-gray-300 bg-white text-gray-900 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="CAD">CAD (C$)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="AUD">AUD (A$)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Primary Funding Source *
                      </label>
                      <select
                        value={budget.fundingSource}
                        onChange={(e) => {
                          setBudget({ ...budget, fundingSource: e.target.value });
                          if (validationErrors.fundingSource) {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.fundingSource;
                              return newErrors;
                            });
                          }
                        }}
                        className={`w-full border-2 ${validationErrors.fundingSource ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-900 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium`}
                      >
                        <option value="" className="text-gray-600">Select source</option>
                        <option value="personal">Personal/Family Savings</option>
                        <option value="loan">Education Loan</option>
                        <option value="scholarship">Scholarship</option>
                        <option value="sponsor">Company Sponsor</option>
                        <option value="assistantship">University Assistantship</option>
                      </select>
                      {validationErrors.fundingSource && (
                        <p className="text-red-600 text-sm mt-1 font-medium">{validationErrors.fundingSource}</p>
                      )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={budget.scholarshipInterest}
                          onChange={(e) => setBudget({ ...budget, scholarshipInterest: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="font-bold text-gray-900">Interested in scholarships?</span>
                          <p className="text-sm text-gray-700 mt-1 font-medium">
                            We&apos;ll help you find scholarships matching your profile
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Exams & Documents */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FileText className="text-amber-600" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Exams & Documents</h2>
                      <p className="text-gray-700 font-medium">Track your preparation progress</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        IELTS Score
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 7.5"
                        value={exams.ieltsScore}
                        onChange={(e) => setExams({ ...exams, ieltsScore: e.target.value })}
                        className="w-full border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-600 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        TOEFL Score
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 105"
                        value={exams.toeflScore}
                        onChange={(e) => setExams({ ...exams, toeflScore: e.target.value })}
                        className="w-full border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-600 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        GRE Score
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 320"
                        value={exams.greScore}
                        onChange={(e) => setExams({ ...exams, greScore: e.target.value })}
                        className="w-full border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-600 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        GMAT Score
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 680"
                        value={exams.gmatScore}
                        onChange={(e) => setExams({ ...exams, gmatScore: e.target.value })}
                        className="w-full border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-600 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Exam Status *
                      </label>
                      <select
                        value={exams.examStatus}
                        onChange={(e) => setExams({ ...exams, examStatus: e.target.value })}
                        className="w-full border-2 border-gray-300 bg-white text-gray-900 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      >
                        <option value="planned">Planned/Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        SOP Status *
                      </label>
                      <select
                        value={exams.sopStatus}
                        onChange={(e) => setExams({ ...exams, sopStatus: e.target.value })}
                        className="w-full border-2 border-gray-300 bg-white text-gray-900 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="draft">Draft</option>
                        <option value="review">Under Review</option>
                        <option value="finalized">Finalized</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-10 pt-6 border-t-2 border-gray-300 flex justify-between">
                {step > 1 ? (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-2 px-6 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-900"
                  >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {step < 4 ? (
                  <button
                    onClick={handleNextStep}
                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
                  >
                    <span>Continue</span>
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        <span>Complete Profile & Go to Dashboard</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-700 font-medium">
          <p>You can always update this information later from your dashboard</p>
        </div>
      </div>
    </main>
  );
}