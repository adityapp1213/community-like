import EventCard from "../components/events/EventCard.jsx";
import ProjectCard from "../components/projects/ProjectCard.jsx";
import Empty from "../components/EmptyState.jsx";
import FriendsPage from "./FriendsPage.jsx";

export default function SearchResultsPage({
  posts,
  people,
  events,
  users,
  activity,
  busy,
  act,
  currentUser,
  api,
  refresh,
  notify,
  go,
}) {
  const hasResults = posts.length || people.length || events.length;
  if (!hasResults)
    return <Empty title="No results found" detail="Try a different search." />;

  return (
    <div className="search-results">
      {posts.length > 0 && (
        <section className="search-result-group">
          <div className="section-heading">
            <h2>Projects</h2>
            <span>{posts.length} RESULTS</span>
          </div>
          <div className="feed-list">
            {posts.map((post) => (
              <ProjectCard
                key={post.id}
                post={post}
                users={users}
                activity={activity}
                busy={busy}
                act={act}
                api={api}
                refresh={refresh}
                currentUser={currentUser}
                notify={notify}
              />
            ))}
          </div>
        </section>
      )}
      {people.length > 0 && (
        <section className="search-result-group">
          <div className="section-heading">
            <h2>Friends</h2>
            <span>{people.length} RESULTS</span>
          </div>
          <FriendsPage
            people={people}
            activity={activity}
            act={act}
            busy={busy}
          />
        </section>
      )}
      {events.length > 0 && (
        <section className="search-result-group">
          <div className="section-heading">
            <h2>Events</h2>
            <span>{events.length} RESULTS</span>
          </div>
          <div className="event-list">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                users={users}
                activity={activity}
                act={act}
                go={go}
                currentUser={currentUser}
                api={api}
                refresh={refresh}
                notify={notify}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
