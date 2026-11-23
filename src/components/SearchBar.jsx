import { useRef, useState } from "react";

export default function SearchBar({ value, onChange, placeholder, scopes }) {
  const input = useRef(null);
  const [focused, setFocused] = useState(false);
  const expanded = focused || Boolean(value);

  return (
    <div className={`search ${expanded ? "search-expanded" : ""}`}>
      <label className="search-field">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.8" cy="10.8" r="6.7" />
          <path d="m16 16 4.2 4.2" />
        </svg>
        <input
          ref={input}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(event) => {
            if (event.key === "Escape") onChange("");
          }}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {value && (
          <button
            type="button"
            className="search-clear"
            aria-label="Clear search"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              onChange("");
              input.current?.focus();
            }}
          >
            ×
          </button>
        )}
      </label>
      {expanded && (
        <div className="search-context" aria-label="Search includes">
          {scopes.map((scope) => (
            <span key={scope}>@{scope}</span>
          ))}
        </div>
      )}
    </div>
  );
}
