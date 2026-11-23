import { useState } from "react";
import Avatar from "../Avatar.jsx";

export default function ProjectComposer({ user, api, refresh, notify }) {
  const [text, setText] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState("");
  const [preview, setPreview] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api("/projects", {
        method: "POST",
        body: JSON.stringify({
          title: text.split(/[.!?]/)[0].slice(0, 72) || "New project",
          text,
          location,
          image: file || "assets/project-workbench.png",
        }),
      });
      setText("");
      setLocation("");
      setFile("");
      setPreview("");
      await refresh();
      notify("Project posted");
    } catch (error) {
      notify(error.message);
    }
  };
  return (
    <form className="composer card" onSubmit={submit}>
      <div className="composer-row">
        <Avatar person={user} />
        <textarea
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What are you building? Where could you use a hand?"
        />
      </div>
      <input
        className="field"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="University"
      />
      {preview && (
        <div className="upload-preview">
          <img src={preview} alt="Selected project" />
          <button
            type="button"
            onClick={() => {
              setFile("");
              setPreview("");
            }}
          >
            ×
          </button>
        </div>
      )}
      <div className="composer-actions">
        <label className="upload-link">
          ＋ Media
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected && selected.size > 6 * 1024 * 1024) {
                notify("Choose an image smaller than 6 MB.");
                return;
              }
              if (selected) {
                setPreview(URL.createObjectURL(selected));
                const reader = new FileReader();
                reader.onload = () => setFile(String(reader.result));
                reader.readAsDataURL(selected);
              }
            }}
          />
        </label>
        <button className="button primary">Post project</button>
      </div>
    </form>
  );
}
