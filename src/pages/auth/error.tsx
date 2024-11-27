import { type NextPage } from "next";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

const AuthErrorPage: NextPage = () => {
  const router = useRouter();
  const { provider } = router.query;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-4xl font-bold text-red-500">
          Authentication Error
        </h1>
        <p className="text-center">
          There was an error logging in with {provider}. Please try again.
        </p>
        <Button
          onClick={() => void router.push("/auth/login")}
          className="mt-4"
        >
          Back to Login
        </Button>
      </div>
    </main>
  );
};

export default AuthErrorPage;
