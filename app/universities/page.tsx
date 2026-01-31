'use client';

import Link from "next/link";
import RouteGuard from "../components/RouteGuard";

export default function UniversitiesPage() {
  const { token } = useAuthStore();
  const [shortlistIDs, setShortlistIDs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Dummy Discovery Data
  const universities = [
    { id: "1", name: "Massachusetts Institute of Technology (MIT)", location: "USA", risk: "Dream", cost: "$$$" },
    { id: "2", name: "Stanford University", location: "USA", risk: "Dream", cost: "$$$" },
    { id: "3", name: "University of Toronto", location: "Canada", risk: "Target", cost: "$$" },
    { id: "4", name: "University of Waterloo", location: "Canada", risk: "Target", cost: "$$" },
    { id: "5", name: "Arizona State University", location: "USA", risk: "Safe", cost: "$$" },
    { id: "6", name: "University of Melbourne", location: "Australia", risk: "Target", cost: "$$$" },
    { id: "7", name: "Technical University of Munich", location: "Germany", risk: "Safe", cost: "$" },
    { id: "8", name: "Oxford University", location: "UK", risk: "Dream", cost: "$$$" },
  ];

  useEffect(() => {
    const fetchShortlist = async () => {
      if (!token) return;
      try {
        const res = await fetch("https://ai-counsellor-backend-jyfb.onrender.com/universities/shortlist", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const list = await res.json();
          // Assuming existing shortlist uses names as unique identifiers or we match by name
          // The discovery list uses IDs '1', '2'. The backend shortlist stores 'universityName'.
          // Let's match by Name for this prototype.
          const names = new Set(list.map((i: any) => i.universityName));
          setShortlistIDs(names);
        }
      } catch (error) {
        console.error("Failed to fetch info", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShortlist();
  }, [token]);

  const handleShortlist = async (uni: any) => {
    try {
      const res = await fetch("https://ai-counsellor-backend-jyfb.onrender.com/universities/shortlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          universityName: uni.name,
          universityId: uni.id,
          location: uni.location,
          category: uni.risk,
          course: "Computer Science" // Default for prototype
        })
      });

      if (res.ok) {
        setShortlistIDs(prev => new Set(prev).add(uni.name));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <RouteGuard requireLogin requireProfile>
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">University Discovery</h1>
              <p className="text-gray-600 mt-1">
                Based on your profile, here are recommended universities.
              </p>
            </div>
            <Link href="/lock">
              <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition">
                View Shortlist & Lock <ArrowRight size={20} />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universities.map((uni) => {
              const isShortlisted = shortlistIDs.has(uni.name);
              return (
                <div key={uni.id} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{uni.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${uni.risk === "Dream" ? "bg-red-100 text-red-700" :
                      uni.risk === "Target" ? "bg-blue-100 text-blue-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                      {uni.risk}
                    </span>
                  </div>
                  <p className="text-gray-500 mb-2 text-sm flex items-center gap-1">
                    <MapPin size={14} /> {uni.location}
                  </p>
                  <p className="text-gray-500 mb-6 text-sm flex items-center gap-1">
                    <DollarSign size={14} /> Cost: {uni.cost}
                  </p>

                  <button
                    onClick={() => handleShortlist(uni)}
                    disabled={isShortlisted}
                    className={`w-full py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${isShortlisted
                      ? "bg-gray-100 text-gray-500 cursor-default"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
                      }`}
                  >
                    {isShortlisted ? (
                      <>
                        <CheckCircle size={18} /> Shortlisted
                      </>
                    ) : (
                      <>
                        <Plus size={18} /> Add to Shortlist
                      </>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </RouteGuard>
  );
}
