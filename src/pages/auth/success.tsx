import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const AuthSuccessPage: NextPage = () => {
  const router = useRouter();
  const { provider, userId } = router.query;

  useEffect(() => {
    if (userId) {
      // Store the auth info
      localStorage.setItem("userId", userId.toString());
      
      // Close the popup window and notify the parent
      if (window.opener) {
        window.opener.postMessage({ type: "AUTH_SUCCESS", userId }, "*");
        window.close();
      } else {
        // Fallback for non-popup navigation
        void router.push("/dashboard");
      }
    }
  }, [userId, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-4xl font-bold">
          Successfully logged in with {provider}!
        </h1>
        <p>You can close this window now.</p>
      </div>
    </main>
  );
};

export default AuthSuccessPage;
