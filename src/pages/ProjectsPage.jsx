import ProjectCard from "../components/projects/ProjectCard.jsx";
import ProjectComposer from "../components/projects/ProjectComposer.jsx";
import Empty from "../components/EmptyState.jsx";

export default function ProjectsPage({
  user,
  posts,
  users,
  activity,
  busy,
  act,
  api,
  refresh,
  currentUser,
  notify,
}) {
  return (
    <>
      <ProjectComposer
        user={user}
        api={api}
        refresh={refresh}
        notify={notify}
      />
      <section className="feed-list">
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
        {!posts.length && (
          <Empty
            title="No projects found"
            detail="Try another search or share what you are working on."
          />
        )}
      </section>
    </>
  );
}
