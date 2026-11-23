import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import "./index.css";
import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  root.render(
    <main className="loading-screen">
      <img src="/assets/logo.png" alt="Community Like" />
      <h1>Clerk is not configured</h1>
      <p>
        Add VITE_CLERK_PUBLISHABLE_KEY to community-react/.env, then restart the
        React development server.
      </p>
    </main>,
  );
} else {
  root.render(
    <StrictMode>
      <ClerkProvider
        publishableKey={publishableKey}
        signInUrl="/"
        signUpUrl="/sign/register"
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        localization={{
          signIn: {
            start: {
              title: "Sign in to Community Like",
              titleCombined: "Sign in to Community Like",
              subtitle: "Welcome back. Keep building.",
              subtitleCombined: "Welcome back. Keep building.",
            },
          },
          signUp: {
            start: {
              title: "Join Community Like",
              subtitle: "Share what you are building and meet your people.",
            },
          },
        }}
      >
        <App />
      </ClerkProvider>
    </StrictMode>,
  );
}
