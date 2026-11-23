import { SignIn, SignUp } from "@clerk/react";
import AuthShell from "../components/auth/AuthShell.jsx";
import clerkAppearance from "../components/auth/clerkAppearance.js";

export default function AuthPage({ mode, go }) {
  const isRegistering = mode === "register";

  return (
    <AuthShell go={go}>
      {isRegistering ? (
        <SignUp
          routing="hash"
          signInUrl="/"
          fallbackRedirectUrl="/"
          signInFallbackRedirectUrl="/"
          appearance={clerkAppearance}
        />
      ) : (
        <SignIn
          routing="hash"
          signUpUrl="/sign/register"
          fallbackRedirectUrl="/"
          signUpFallbackRedirectUrl="/"
          appearance={clerkAppearance}
        />
      )}
    </AuthShell>
  );
}
