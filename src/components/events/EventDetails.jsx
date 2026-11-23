import Avatar from "../Avatar.jsx";
import Empty from "../EmptyState.jsx";
import { image } from "../../utils.js";

export default function EventDetails({
  id,
  data,
  activity,
  act,
  currentUser,
  go,
  api,
  refresh,
  notify,
}) {
  const event = data.events.find((item) => item.id === id);
  if (!event)
    return <Empty title="Event not found" detail="It may have been removed." />;
  const host = data.users.find(
    (item) => item.clerkId === event.host || item.id === event.host,
  ) || { name: "Community host" };
  return (
    <article className="event-detail card">
      <img
        className="detail-banner"
        src={image(event.image || "event-workshop.png")}
        alt=""
      />
      <div className="detail-content">
        <button className="text-button" onClick={() => go("/events")}>
          ← All events
        </button>
        <div className="host-line detail-host">
          <Avatar person={host} />
          <div>
            <strong>{host.name}</strong>
            <span>{host.handle}</span>
          </div>
        </div>
        <span className="eyebrow">{event.category}</span>
        <h2>{event.title}</h2>
        <p>{event.text}</p>
        <div className="detail-meta">
          <div>
            <span>WHEN</span>
            <strong>
              {new Date(event.date).toLocaleString("en-IN", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </strong>
          </div>
          <div>
            <span>WHERE</span>
            <strong>{event.location}</strong>
          </div>
          <div>
            <span>ATTENDING</span>
            <strong>{event.going} people</strong>
          </div>
        </div>
        <button
          className="button primary"
          onClick={() =>
            act("rsvp", event.id, !activity.events.includes(event.id))
          }
        >
          {activity.events.includes(event.id) ? "Joined ✓" : "Join"}
        </button>
        {event.host === currentUser.id && (
          <button
            className="button danger"
            onClick={async () => {
              if (confirm("Delete this event?")) {
                await api(`/events/${event.id}`, { method: "DELETE" });
                await refresh();
                go("/events");
                notify("Event deleted");
              }
            }}
          >
            Delete event
          </button>
        )}
      </div>
    </article>
  );
}
