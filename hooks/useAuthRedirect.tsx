import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

/**
 * Custom hook to protect pages and redirect unauthenticated users to /auth
 * @returns {Object} { session, status } - Session data and loading status
 */
export const useAuthRedirect = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading session
    if (!session) {
      router.push("/auth");
    }
  }, [session, status, router]);

  return { session, status };
};