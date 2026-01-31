'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ReactNode } from "react";

interface RouteGuardProps {
  children: ReactNode;
  requireLogin?: boolean;
  requireProfile?: boolean;
}

export default function RouteGuard({
  children,
  requireLogin = false,
  requireProfile = false,
}: RouteGuardProps) {

  const router = useRouter();

  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const profileComplete = useAuthStore((s) => s.profileComplete);

  // ✅ hydration state
  const [hydrated, setHydrated] = useState(true);

  useEffect(() => {
    // wait until Zustand loads localStorage
    if (!hydrated) return;

    if (requireLogin && !isLoggedIn) {
      router.push("/login");
      return;
    }

    const checkProfile = async () => {
      if (requireProfile && !profileComplete && isLoggedIn) {
        try {
          const token = useAuthStore.getState().token;
          const res = await fetch("https://ai-counsellor-backend-jyfb.onrender.com/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (res.ok) {
            // Profile exists on server, sync local state
            useAuthStore.getState().completeProfile();
          } else {
            // Profile genuinely missing
            router.push("/onboarding");
          }
        } catch (error) {
          console.error("RouteGuard profile check failed", error);
          // Only redirect on definitive failure if you want strictness, 
          // or allow access if uncertain. For now, we redirect on error to be safe 
          // but arguably we should show an error state.
          // Let's assume if fetch fails, we might as well go to onboarding or stay put?
          // Going to onboarding is safer for flow.
          router.push("/onboarding");
        }
      }
    };

    checkProfile();

  }, [hydrated, isLoggedIn, profileComplete, requireLogin, requireProfile, router]);


  // ✅ SAFE conditional render AFTER hooks
  if (!hydrated) return null;

  return children;
}
