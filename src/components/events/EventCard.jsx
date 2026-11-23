import { useState } from "react";
import Avatar from "../Avatar.jsx";
import { image, localDateTime } from "../../utils.js";

export default function EventCard({
  event,
  users,
  activity,
  act,
  go,
  currentUser,
  api,
  refresh,
  notify,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    ...event,
    date: localDateTime(event.date),
  });
  const host = users.find(
    (item) => item.clerkId === event.host || item.id === event.host,
  ) || { name: "Community host" };
  const saveEvent = async (formEvent) => {
    formEvent.preventDefault();
    try {
      await api(`/events/${event.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...draft,
          date: new Date(draft.date).toISOString(),
        }),
      });
      await refresh();
      setEditing(false);
      notify("Event updated");
    } catch (error) {
      notify(error.message);
    }
  };
  return (
    <article className="event-card card">
      <img src={image(event.image || "event-workshop.png")} alt="" />
      <div>
        {editing ? (
          <form className="inline-edit" onSubmit={saveEvent}>
            <input
              required
              maxLength={90}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            >
              <option>Workshop</option>
              <option>Training session</option>
              <option>Project showcase</option>
              <option>Peer help</option>
            </select>
            <input
              required
              type="datetime-local"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
            <input
              required
              maxLength={120}
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            />
            <textarea
              required
              maxLength={500}
              value={draft.text}
              onChange={(e) => setDraft({ ...draft, text: e.target.value })}
            />
            <label className="upload-link">
              Change event banner
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.size > 6 * 1024 * 1024) {
                    notify("Choose an image smaller than 6 MB.");
                    return;
                  }
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () =>
                      setDraft({ ...draft, image: String(reader.result) });
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
            <button className="button primary">Save event</button>
            <button
              type="button"
              className="button secondary"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <span className="eyebrow">{event.category}</span>
            <h2>{event.title}</h2>
            <p>
              {new Date(event.date).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              · {event.location}
            </p>
            <p>{event.text}</p>
          </>
        )}
        <span className="host-line">
          <Avatar person={host} />
          Hosted by {host.name}
        </span>
        <div className="event-actions">
          <button
            className="button primary"
            onClick={() =>
              act("rsvp", event.id, !activity.events.includes(event.id))
            }
          >
            {activity.events.includes(event.id) ? "Joined ✓" : "Join event"}
          </button>
          <button
            className="button secondary"
            onClick={() => go(`/event/${encodeURIComponent(event.id)}`)}
          >
            Details
          </button>
          {event.host === currentUser.id && (
            <>
              <button
                className="text-button"
                onClick={() => setEditing((value) => !value)}
              >
                Edit
              </button>
              <button
                className="text-button danger"
                onClick={async () => {
                  if (confirm("Delete this event?")) {
                    await api(`/events/${event.id}`, { method: "DELETE" });
                    await refresh();
                    notify("Event deleted");
                  }
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
