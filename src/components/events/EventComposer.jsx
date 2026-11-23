import { useState } from "react";

export default function EventComposer({ api, refresh, notify }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({
    title: "",
    category: "Workshop",
    date: "",
    time: "",
    location: "",
    text: "",
  });
  const [banner, setBanner] = useState("");
  const field = (key, value) =>
    setValues((current) => ({ ...current, [key]: value }));
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api("/events", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          date: new Date(`${values.date}T${values.time}`).toISOString(),
          image: banner || "assets/event-workshop.png",
        }),
      });
      setOpen(false);
      setBanner("");
      await refresh();
      notify("Event created");
    } catch (error) {
      notify(error.message);
    }
  };
  return (
    <section className="event-create card">
      <div className="section-head">
        <div>
          <span className="eyebrow">LEARN TOGETHER</span>
          <h2>Create an event</h2>
          <p>Invite people to a workshop, build session, or showcase.</p>
        </div>
        <button className="button primary" onClick={() => setOpen(!open)}>
          {open ? "Close" : "+ New event"}
        </button>
      </div>
      {open && (
        <form className="form-grid" onSubmit={submit}>
          <input
            required
            placeholder="Event name"
            value={values.title}
            onChange={(e) => field("title", e.target.value)}
          />
          <select
            value={values.category}
            onChange={(e) => field("category", e.target.value)}
          >
            <option>Workshop</option>
            <option>Training session</option>
            <option>Project showcase</option>
            <option>Peer help</option>
          </select>
          <input
            required
            type="date"
            value={values.date}
            onChange={(e) => field("date", e.target.value)}
          />
          <input
            required
            type="time"
            value={values.time}
            onChange={(e) => field("time", e.target.value)}
          />
          <input
            required
            placeholder="Location"
            value={values.location}
            onChange={(e) => field("location", e.target.value)}
          />
          <input
            required
            placeholder="What will happen?"
            value={values.text}
            onChange={(e) => field("text", e.target.value)}
          />
          <label className="upload-link">
            ＋ Add banner
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size > 6 * 1024 * 1024) {
                  notify("Choose an image smaller than 6 MB.");
                  return;
                }
                if (f) {
                  const reader = new FileReader();
                  reader.onload = () => setBanner(String(reader.result));
                  reader.readAsDataURL(f);
                }
              }}
            />
          </label>
          {banner && (
            <img className="banner-preview" src={banner} alt="Banner preview" />
          )}
          <button className="button primary">Create event</button>
        </form>
      )}
    </section>
  );
}
