'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import RouteGuard from "../components/RouteGuard";
import { Lock, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

export default function LockPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchShortlist = async () => {
      if (!token) return;
      try {
        const res = await fetch("https://ai-counsellor-backend-jyfb.onrender.com/universities/shortlist", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setShortlist(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShortlist();
  }, [token]);

  const handleLock = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to lock ${name}? This will commit you to this university and generate your application tasks.`)) {
      return;
    }
    setProcessing(id.toString());
    try {
      const res = await fetch(`https://ai-counsellor-backend-jyfb.onrender.com/universities/lock/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert(`${name} locked successfully! Application tasks generated.`);
        router.push("/tasks");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to lock university");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <RouteGuard requireLogin>
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Finalize Your University</h1>
          <p className="text-gray-600 mb-8">
            Locking a university will unlock the <b>Application Guidance</b> module tailored to that specific university.
            You must lock at least one university to proceed.
          </p>

          {shortlist.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow text-center">
              <p className="mb-4 text-lg">You haven't shortlisted any universities yet.</p>
              <button
                onClick={() => router.push("/universities")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold"
              >
                Go to Discovery
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {shortlist.map((uni) => (
                <div key={uni.id} className={`bg-white p-6 rounded-xl shadow border-l-4 ${uni.isLocked ? 'border-green-500' : 'border-blue-500'}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold">{uni.universityName}</h2>
                      <p className="text-gray-500 text-sm mt-1">{uni.location} • {uni.category}</p>
                    </div>

                    {uni.isLocked ? (
                      <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full">
                        <CheckCircle size={20} />
                        LOCKED
                      </div>
                    ) : (
                      <button
                        onClick={() => handleLock(uni.id, uni.universityName)}
                        disabled={!!processing}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                      >
                        {processing === uni.id.toString() ? "Processing..." : (
                          <>
                            <Lock size={18} />
                            Lock & Proceed
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </RouteGuard>
  );
}
