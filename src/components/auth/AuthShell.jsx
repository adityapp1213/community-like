import { image } from "../../utils.js";
import "./auth.css";

export default function AuthShell({ children, go }) {
  return (
    <main className="auth-page">
      <div className="auth-shell">
        <aside className="auth-artwork" aria-label="Community Like">
          <img
            className="auth-image"
            src="/assets/auth/grain-study.png"
            alt=""
          />
          <div className="auth-brand-story">
            <a
              className="auth-brand"
              href="/"
              onClick={(event) => {
                event.preventDefault();
                go("/");
              }}
            >
              <img src={image("logo.png")} alt="Community Like" />
            </a>
            <p className="auth-statement">
              Share what you’re building.
            </p>
          </div>
        </aside>

        <section
          className="auth-panel"
          aria-label="Your Community Like account"
        >
          <a
            className="auth-home"
            href="/"
            onClick={(event) => {
              event.preventDefault();
              go("/");
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M20 12H4m0 0 7-7m-7 7 7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Home
          </a>
          <div className="auth-form">{children}</div>
        </section>
      </div>
    </main>
  );
}
