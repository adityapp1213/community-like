import Avatar from "../components/Avatar.jsx";

function PersonCard({ person, isFriend, isFollowing, act, busy }) {
  const id = person.clerkId || person.id;
  const skills = (person.skills || []).slice(0, 3);

  return (
    <article className="friend-card">
      <div className="friend-card-top">
        <Avatar person={person} className="friend-avatar" />
        <div className="friend-card-identity">
          <h3>{person.name}</h3>
          <span>{person.handle}</span>
        </div>
        <span className="friend-status">
          {isFriend ? "FRIEND" : "SUGGESTED"}
        </span>
      </div>
      {person.affiliation && (
        <p className="friend-affiliation">{person.affiliation}</p>
      )}
      <p className="friend-bio">
        {person.bio || "Building projects and learning with the community."}
      </p>
      {skills.length > 0 && (
        <div className="friend-skills">
          {skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      )}
      <div className="friend-card-footer">
        <span className="friend-follower-count">
          <strong>{person.followers || 0}</strong> followers
        </span>
        <div className="friend-actions">
          <button
            className={isFriend ? "button secondary" : "button primary"}
            disabled={busy}
            aria-pressed={isFriend}
            onClick={() => act("friend", id, !isFriend)}
          >
            {isFriend ? "Remove friend" : "Add friend"}
          </button>
          <button
            className={`follow-toggle ${isFollowing ? "following" : ""}`}
            disabled={busy}
            aria-pressed={isFollowing}
            onClick={() => act("follow", id, !isFollowing)}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function FriendsPage({ people, activity, act, busy = false }) {
  const friends = people.filter((person) =>
    activity.friends.includes(person.clerkId || person.id),
  );
  const suggestions = people.filter(
    (person) => !activity.friends.includes(person.clerkId || person.id),
  );

  return (
    <div className="friends-page">
      <section className="friends-section">
        <div className="friends-section-heading">
          <div>
            <h2>Your friends</h2>
            <p>People you have added to your community.</p>
          </div>
          <span className="friends-count">{friends.length}</span>
        </div>
        {friends.length ? (
          <div className="friends-grid">
            {friends.map((person) => {
              const id = person.clerkId || person.id;
              return (
                <PersonCard
                  key={id}
                  person={person}
                  isFriend
                  isFollowing={activity.following.includes(id)}
                  act={act}
                  busy={busy}
                />
              );
            })}
          </div>
        ) : (
          <div className="friends-empty">
            <h3>No friends yet</h3>
            <p>Add someone from the suggestions below to get started.</p>
          </div>
        )}
      </section>

      <section className="friends-section">
        <div className="friends-section-heading">
          <div>
            <h2>People to meet</h2>
            <p>Find students working on things you care about.</p>
          </div>
          <span className="friends-count">{suggestions.length}</span>
        </div>
        {suggestions.length ? (
          <div className="friends-grid">
            {suggestions.map((person) => {
              const id = person.clerkId || person.id;
              return (
                <PersonCard
                  key={id}
                  person={person}
                  isFriend={false}
                  isFollowing={activity.following.includes(id)}
                  act={act}
                  busy={busy}
                />
              );
            })}
          </div>
        ) : (
          <div className="friends-empty">
            <h3>You’re all caught up</h3>
            <p>Everyone in this list is already your friend.</p>
          </div>
        )}
      </section>
    </div>
  );
}
