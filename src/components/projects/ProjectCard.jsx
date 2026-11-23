import { useState } from "react";
import Avatar from "../Avatar.jsx";
import { image } from "../../utils.js";

function ActionIcon({ name }) {
  const paths = {
    like: (
      <>
        <path d="M7 10v11H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3Z" />
        <path d="M7 10 12 3a2 2 0 0 1 2 2l-1 5h5a2 2 0 0 1 2 2l-2 7a2 2 0 0 1-2 2H7" />
      </>
    ),
    comment: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
      </>
    ),
    share: (
      <>
        <path d="m17 1 4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="m7 23-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    save: (
      <>
        <path d="M6 3h12a2 2 0 0 1 2 2v16l-8-5-8 5V5a2 2 0 0 1 2-2Z" />
      </>
    ),
    edit: (
      <>
        <path d="m15 5 4 4" />
        <path d="M4 20 5 16 16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[name]}
    </svg>
  );
}

export default function ProjectCard({
  post,
  users,
  activity,
  busy,
  act,
  api,
  refresh,
  currentUser,
  notify,
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post);
  const author = users.find(
    (item) => item.clerkId === post.author || item.id === post.author,
  ) || { name: "Community member" };
  const comment = async (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api("/comments", {
        method: "POST",
        body: JSON.stringify({ projectId: post.id, text: commentText.trim() }),
      });
      setCommentText("");
      await refresh();
    } catch (error) {
      alert(error.message);
    }
  };
  const saveProject = async (event) => {
    event.preventDefault();
    try {
      const description = draft.text.trim();
      await api(`/projects/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...draft,
          title: description.split(/[.!?]/)[0].slice(0, 72) || "New project",
          text: description,
        }),
      });
      await refresh();
      setEditing(false);
      notify("Project updated");
    } catch (error) {
      notify(error.message);
    }
  };
  return (
    <article className="project-card card">
      <div className="project-body">
        <div className="author-line">
          <Avatar person={author} />
          <div>
            <strong>{author.name}</strong>
            <span className="author-handle">{author.handle}</span>
            <span>{author.affiliation}</span>
          </div>
          {post.author === currentUser.id && (
            <button
              className="post-edit-icon"
              aria-label="Edit project"
              title="Edit project"
              onClick={() => setEditing((value) => !value)}
            >
              <ActionIcon name="edit" />
            </button>
          )}
        </div>
        {post.location && <span className="university">{post.location}</span>}
        {editing ? (
          <form className="inline-edit" onSubmit={saveProject}>
            <textarea
              required
              maxLength={500}
              value={draft.text}
              onChange={(event) =>
                setDraft({ ...draft, text: event.target.value })
              }
            />
            <input
              maxLength={100}
              value={draft.location}
              placeholder="University"
              onChange={(event) =>
                setDraft({ ...draft, location: event.target.value })
              }
            />
            <label className="upload-link">
              Change project image
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
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
            <button className="button primary">Save changes</button>
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setDraft(post);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </form>
        ) : (
          <>
            <div className="project-copy">
              <p>{post.text || post.title}</p>
            </div>
          </>
        )}
      </div>
      {!editing && (
        <div className="project-media">
          <img
            className="project-image"
            src={image(post.image || "project-workbench.png")}
            alt={post.title}
          />
        </div>
      )}
      <div className="project-footer">
        <div className="post-actions">
          <button
            disabled={busy}
            className={activity.likes.includes(post.id) ? "chosen" : ""}
            aria-pressed={activity.likes.includes(post.id)}
            aria-label={`Likes, ${post.likes || 0}`}
            onClick={() =>
              act("like", post.id, !activity.likes.includes(post.id))
            }
          >
            <ActionIcon name="like" />
            <span className="post-action-label">Likes</span>
            <span className="post-action-count">{post.likes || 0}</span>
          </button>
          <button
            aria-label={`Comments, ${post.comments || 0}`}
            onClick={() => setCommentsOpen((open) => !open)}
          >
            <ActionIcon name="comment" />
            <span>{post.comments || 0}</span>
          </button>
          <button
            aria-label={`Share, ${post.shares || 0}`}
            onClick={() => {
              navigator.clipboard?.writeText(location.href);
              act("share", post.id, true);
            }}
          >
            <ActionIcon name="share" />
            <span>{post.shares || 0}</span>
          </button>
          <button
            disabled={busy}
            className={activity.saved.includes(post.id) ? "chosen" : ""}
            aria-pressed={activity.saved.includes(post.id)}
            aria-label={`Save project, ${post.saves || 0}`}
            onClick={() =>
              act("save", post.id, !activity.saved.includes(post.id))
            }
          >
            <ActionIcon name="save" />
            <span>{post.saves || 0}</span>
          </button>
        </div>
      </div>
      <div className="project-comments-wrap">
        {commentsOpen && (
          <section className="comments-panel" aria-label="Project comments">
            {(post.commentItems || []).map((item) => {
              const commenter = users.find(
                (person) =>
                  person.clerkId === item.userId || person.id === item.userId,
              );
              return (
                <p className="comment-item" key={item.id}>
                  <strong>{commenter?.name || "Community member"}</strong>
                  {item.text}
                  {item.userId === currentUser.id && (
                    <span className="comment-controls">
                      <button
                        onClick={async () => {
                          const text = prompt("Edit your comment", item.text);
                          if (!text?.trim()) return;
                          try {
                            await api(`/comments/${item.id}`, {
                              method: "PATCH",
                              body: JSON.stringify({ text: text.trim() }),
                            });
                            await refresh();
                          } catch (error) {
                            notify(error.message);
                          }
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm("Delete this comment?")) return;
                          try {
                            await api(`/comments/${item.id}`, {
                              method: "DELETE",
                            });
                            await refresh();
                          } catch (error) {
                            notify(error.message);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </span>
                  )}
                </p>
              );
            })}
            <form className="comment-form" onSubmit={comment}>
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Add a helpful comment"
                maxLength={500}
                required
              />
              <button className="button secondary">Comment</button>
            </form>
          </section>
        )}
      </div>
    </article>
  );
}
