'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
  Globe,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Users,
  Target,
  BookOpen,
  Shield
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and numbers";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const signupResponse = await fetch("https://ai-counsellor-backend-jyfb.onrender.com/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        throw new Error(signupData.message || "Signup failed");
      }

      const loginResponse = await fetch("https://ai-counsellor-backend-jyfb.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData.message || "Auto-login failed");
      }

      login(loginData.token, loginData.user?.profileCompleted || false);

      setSignupSuccess(true);

      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', formData.fullName);

      setTimeout(() => {
        router.push("/onboarding");
      }, 2000);

    } catch (err) {
      if (err instanceof Error) {
        setErrors(prev => ({ ...prev, submit: err.message }));
      } else {
        setErrors(prev => ({ ...prev, submit: "Something went wrong. Please try again." }));
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!formData.password) return 0;

    let strength = 0;
    if (formData.password.length >= 8) strength += 25;
    if (/[a-z]/.test(formData.password)) strength += 25;
    if (/[A-Z]/.test(formData.password)) strength += 25;
    if (/[0-9]/.test(formData.password)) strength += 25;

    return strength;
  };

  const getPasswordStrengthColor = () => {
    const strength = passwordStrength();
    if (strength < 50) return "bg-red-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <main className="h-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 px-4 sm:px-6">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* Left Side - Info Section */}
        <div className="hidden lg:block">
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Start Your Study Abroad Journey</h1>
                  <p className="text-purple-100 mt-2">Join thousands of successful students</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Personalized Roadmap</h3>
                    <p className="text-purple-100 mt-1">Get a custom study plan tailored to your goals</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI University Matching</h3>
                    <p className="text-purple-100 mt-1">Find perfect universities with our smart AI</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Community Support</h3>
                    <p className="text-purple-100 mt-1">Connect with peers and mentors</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Free Resources</h3>
                    <p className="text-purple-100 mt-1">Access SOP samples, interview guides, and more</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="mt-10 pt-6 border-t border-white/20">
              <div className="space-y-4">
                <div className="italic text-purple-100">
                  "The AI counsellor helped me get into my dream university with a scholarship!"
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <div className="font-medium">Sarah Chen</div>
                    <div className="text-sm text-purple-100">Stanford University, CS Masters</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4">
                <User className="text-white" size={28} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-600 mt-2">Start your study abroad journey in minutes</p>
            </div>

            {/* Success Message */}
            {signupSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-green-800 font-medium">Account created successfully!</p>
                  <p className="text-green-600 text-sm mt-1">Redirecting to profile setup...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-red-800 font-medium">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-gray-500" size={20} />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="John Smith"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-500 ${errors.fullName ? 'border-red-400' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    disabled={loading || signupSuccess}
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.fullName}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-gray-500" size={20} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-500 ${errors.email ? 'border-red-400' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    disabled={loading || signupSuccess}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-500" size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-500 ${errors.password ? 'border-red-400' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    disabled={loading || signupSuccess}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading || signupSuccess}
                  >
                    {showPassword ? (
                      <EyeOff className="text-gray-600 hover:text-gray-800" size={20} />
                    ) : (
                      <Eye className="text-gray-600 hover:text-gray-800" size={20} />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-700 mb-1">
                      <span className="font-medium">Password strength:</span>
                      <span className="font-bold">{passwordStrength()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength()}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      <span className="font-medium">Requirements:</span> uppercase, lowercase, number, and 8+ characters
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="text-gray-500" size={20} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-gray-900 placeholder-gray-500 ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    disabled={loading || signupSuccess}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading || signupSuccess}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="text-gray-600 hover:text-gray-800" size={20} />
                    ) : (
                      <Eye className="text-gray-600 hover:text-gray-800" size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-3">
                <label className={`flex items-start gap-3 cursor-pointer ${loading || signupSuccess ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                    disabled={loading || signupSuccess}
                  />
                  <div>
                    <span className="text-sm text-gray-900">
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-semibold">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-semibold">
                        Privacy Policy
                      </Link>
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      By creating an account, you agree to receive important updates about your study abroad journey.
                    </p>
                  </div>
                </label>
                {errors.acceptTerms && (
                  <p className="text-sm text-red-600 font-medium">{errors.acceptTerms}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || signupSuccess}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </>
                ) : signupSuccess ? (
                  <>
                    <CheckCircle size={22} />
                    <span>Account Created!</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight size={22} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <div className="mx-4 text-sm font-medium text-gray-700">Already have an account?</div>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold px-6 py-3 border-2 border-blue-300 rounded-xl hover:bg-blue-50 transition-colors"
              >
                Sign in to existing account
              </Link>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 px-4 py-3 rounded-xl">
                <Shield size={16} className="text-green-600" />
                <span>Your data is secure and encrypted</span>
              </div>
              <p className="text-sm text-gray-600 mt-4 font-medium">
                Free forever. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}