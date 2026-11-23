import { useAuth, useUser } from "@clerk/react";
import { useCallback, useEffect, useState } from "react";
import "./App.css";
import usePage from "./hooks/usePage.js";
import { fallback, image } from "./utils.js";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import EventDetailsPage from "./pages/EventDetailsPage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import SearchBar from "./components/SearchBar.jsx";
import SearchResultsPage from "./pages/SearchResultsPage.jsx";

function App() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [page, go] = usePage();
  const [data, setData] = useState(fallback);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [authTimedOut, setAuthTimedOut] = useState(false);
  useEffect(() => {
    if (isLoaded) return undefined;
    const timer = window.setTimeout(() => setAuthTimedOut(true), 10000);
    return () => window.clearTimeout(timer);
  }, [isLoaded]);
  const api = useCallback(
    async (url, options = {}) => {
      const token = await getToken();
      const response = await fetch(`/api${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });
      if (!response.ok)
        throw new Error(
          (await response.json().catch(() => ({}))).error ||
            "Could not save that change",
        );
      return response.status === 204 ? null : response.json();
    },
    [getToken],
  );
  const refresh = useCallback(async () => {
    if (isSignedIn) setData(await api("/bootstrap"));
  }, [api, isSignedIn]);
  useEffect(() => {
    if (isSignedIn)
      api("/bootstrap")
        .then(setData)
        .catch((error) => setNotice(error.message));
  }, [api, isSignedIn]);
  useEffect(() => {
    if (!isSignedIn) return undefined;
    const controller = new AbortController();
    const pause = (duration) =>
      new Promise((resolve) => window.setTimeout(resolve, duration));

    async function subscribe() {
      while (!controller.signal.aborted) {
        try {
          const token = await getToken();
          const response = await fetch("/api/updates", {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });
          if (!response.ok || !response.body)
            throw new Error("Live updates are unavailable");
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          while (!controller.signal.aborted) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const messages = buffer.split("\n\n");
            buffer = messages.pop() || "";
            if (messages.some((message) => message.includes("event: changed")))
              await refresh();
          }
        } catch {
          if (controller.signal.aborted) break;
          await pause(2500);
        }
      }
    }

    void subscribe();
    return () => controller.abort();
  }, [getToken, isSignedIn, refresh]);
  useEffect(() => {
    if (user && isSignedIn)
      api("/profile/sync", {
        method: "POST",
        body: JSON.stringify({
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
          image: user.imageUrl,
        }),
      })
        .then(refresh)
        .catch((error) => setNotice(error.message));
  }, [api, refresh, user, isSignedIn]);
  const act = async (action, id, enabled) => {
    setBusy(true);
    try {
      await api("/interaction", {
        method: "POST",
        body: JSON.stringify({ action, id, enabled }),
      });
      await refresh();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  };
  const notify = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3500);
  };
  const signedIn = isLoaded && isSignedIn;
  if (!isLoaded && authTimedOut)
    return (
      <main className="loading-screen">
        <img src={image("logo.png")} alt="community like" />
        <h1>Sign in is taking too long</h1>
        <p>Check your connection and Clerk keys in community-react/.env.</p>
        <button className="button secondary" onClick={() => location.reload()}>
          Try again
        </button>
      </main>
    );
  if (!isLoaded)
    return (
      <div className="loading-screen">
        <img src={image("logo.png")} alt="community like" />
        <span>Loading your community</span>
      </div>
    );
  if (!signedIn)
    return (
      <AuthPage
        mode={location.pathname === "/sign/register" ? "register" : "login"}
        go={go}
      />
    );
  const currentUser = data.users.find(
    (item) => item.clerkId === user?.id || item.id === user?.id,
  ) || {
    id: user?.id,
    name: user?.fullName || "Student",
    handle: `@${user?.primaryEmailAddress?.emailAddress || ""}`,
    image: user?.imageUrl,
    bio: "",
  };
  const path = page.split("?")[0];
  const searchMode =
    path === "/friends"
      ? "friends"
      : path === "/events" || path.startsWith("/event/")
        ? "events"
        : "all";
  const nav = [
    ["/", "Projects", "feeds.png"],
    ["/events", "Events", "event.png"],
    ["/friends", "Friends", "friends.png"],
    ["/profile", "Profile", "profile.png"],
  ];
  const posts = data.posts.filter(
    (post) =>
      !query.trim() ||
      `${post.title} ${post.text} ${post.location} ${data.users.find((person) => person.clerkId === post.author || person.id === post.author)?.name || ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const events = data.events.filter(
    (event) =>
      !query.trim() ||
      `${event.title} ${event.text} ${event.location} ${event.category} ${data.users.find((person) => person.clerkId === event.host || person.id === event.host)?.name || ""}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const people = data.users.filter(
    (person) =>
      person.clerkId !== user?.id &&
      (!query.trim() ||
        `${person.name} ${person.handle} ${person.bio} ${person.affiliation} ${person.contact} ${(person.skills || []).join(" ")} ${(person.experience || []).map((entry) => `${entry.role} ${entry.organization}`).join(" ")} ${(person.education || []).map((entry) => `${entry.school} ${entry.degree}`).join(" ")}`
          .toLowerCase()
          .includes(query.trim().toLowerCase())),
  );
  const searching = Boolean(query.trim());
  const title = searching
    ? searchMode === "all"
      ? "Search results"
      : searchMode === "friends"
        ? "Friends"
        : "Events"
    : path === "/events"
      ? "Events"
      : path === "/friends"
        ? "Friends"
        : path === "/profile" || path === "/settings"
          ? "Your profile"
          : "Projects";
  const pageContent = (() => {
    if (searching && searchMode === "friends")
      return (
        <FriendsPage
          people={people}
          activity={data.activity}
          act={act}
          busy={busy}
        />
      );

    if (searching)
      return (
        <SearchResultsPage
          posts={searchMode === "events" ? [] : posts}
          people={searchMode === "events" ? [] : people}
          events={searchMode === "friends" ? [] : events}
          users={data.users}
          activity={data.activity}
          busy={busy}
          act={act}
          currentUser={currentUser}
          api={api}
          refresh={refresh}
          notify={notify}
          go={go}
        />
      );

    const route =
      path === "/"
        ? "projects"
        : path === "/events"
          ? "events"
          : path === "/friends"
            ? "people"
            : path;

    if (route === "projects")
      return (
        <ProjectsPage
          user={currentUser}
          posts={posts}
          users={data.users}
          activity={data.activity}
          busy={busy}
          act={act}
          api={api}
          refresh={refresh}
          currentUser={currentUser}
          notify={notify}
        />
      );
    if (route === "events")
      return (
        <EventsPage
          events={events}
          users={data.users}
          activity={data.activity}
          act={act}
          go={go}
          currentUser={currentUser}
          api={api}
          refresh={refresh}
          notify={notify}
        />
      );
    if (!searching && path.startsWith("/event/"))
      return (
        <EventDetailsPage
          id={decodeURIComponent(path.split("/")[2] || "")}
          data={data}
          activity={data.activity}
          act={act}
          currentUser={currentUser}
          go={go}
          api={api}
          refresh={refresh}
          notify={notify}
        />
      );
    if (route === "people")
      return (
        <FriendsPage
          people={people}
          activity={data.activity}
          act={act}
          busy={busy}
        />
      );
    if (!searching && (path === "/profile" || path === "/settings"))
      return (
        <ProfilePage
          user={currentUser}
          posts={data.posts.filter(
            (post) =>
              post.author === currentUser.clerkId ||
              post.author === currentUser.id,
          )}
          events={data.events.filter((event) =>
            data.activity.events.includes(event.id),
          )}
          api={api}
          refresh={refresh}
          notify={notify}
        />
      );

    return null;
  })();

  return (
    <div className="app-shell">
      <header className="site-brand">
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            go("/");
          }}
        >
          <img src={image("logo.png")} alt="community like" />
          <span>community like</span>
        </a>
      </header>
      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">YOUR CAMPUS COMMUNITY</span>
            <h1>{title}</h1>
          </div>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={
              searchMode === "friends"
                ? "Search friends"
                : searchMode === "events"
                  ? "Search events"
                  : "Search this community"
            }
            scopes={
              searchMode === "friends"
                ? ["FRIENDS"]
                : searchMode === "events"
                  ? ["EVENTS"]
                  : ["PROJECTS", "FRIENDS", "EVENTS"]
            }
          />
        </header>
        {notice && (
          <div className="toast" role="status">
            {notice}
          </div>
        )}
        {pageContent}
      </main>
      <nav className="bottom-nav" aria-label="Main navigation">
        {nav.map(([href, label, icon]) => (
          <a
            key={href}
            href={href}
            className={
              path === href || (href === "/profile" && path === "/settings")
                ? "active"
                : ""
            }
            aria-current={
              path === href || (href === "/profile" && path === "/settings")
                ? "page"
                : undefined
            }
            onClick={(e) => {
              e.preventDefault();
              go(href);
            }}
          >
            <img src={image(icon)} alt="" />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

export default App;
