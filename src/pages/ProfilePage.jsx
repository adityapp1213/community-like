import { useRef, useState } from "react";
import { UserButton, useClerk } from "@clerk/react";
import Avatar from "../components/Avatar.jsx";
import { image } from "../utils.js";

const emptyExperience = {
  role: "",
  organization: "",
  period: "",
  location: "",
};
const emptyEducation = { school: "", degree: "", period: "" };

function readImage(file, setImage, notify) {
  if (file && file.size > 6 * 1024 * 1024) {
    notify("Choose an image smaller than 6 MB.");
    return;
  }
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => setImage(String(reader.result));
  reader.readAsDataURL(file);
}

export default function ProfilePage({
  user,
  posts,
  events,
  api,
  refresh,
  notify,
}) {
  const { openUserProfile } = useClerk();
  const activityTrack = useRef(null);
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [banner, setBanner] = useState(user.banner || "");
  const [avatar, setAvatar] = useState(user.image || "");
  const [affiliation, setAffiliation] = useState(user.affiliation || "");
  const [contact, setContact] = useState(user.contact || "");
  const [experience, setExperience] = useState(user.experience || []);
  const [education, setEducation] = useState(user.education || []);
  const [skills, setSkills] = useState((user.skills || []).join(", "));

  const save = async (event) => {
    event.preventDefault();
    try {
      await api("/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name,
          bio,
          banner,
          image: avatar,
          affiliation,
          contact,
          experience: experience.filter(
            (item) => item.role || item.organization,
          ),
          education: education.filter((item) => item.school),
          skills: skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        }),
      });
      await refresh();
      setEdit(false);
      notify("Profile saved");
    } catch (error) {
      notify(error.message);
    }
  };

  const updateList = (setter, list, index, key, value) => {
    setter(
      list.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  };

  const openEditor = (section) => {
    if (section === "experience" && !experience.length)
      setExperience([{ ...emptyExperience }]);
    if (section === "education" && !education.length)
      setEducation([{ ...emptyEducation }]);
    setEdit(true);
    window.setTimeout(() => {
      const target = document.getElementById(`profile-edit-${section}`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (section === "skills")
        document.getElementById("profile-skills-input")?.focus();
    }, 0);
  };

  return (
    <div className="profile-page">
      <section className="profile-overview card">
        <div className="profile-cover">
          <img
            src={image(banner || "profile-banner.png")}
            alt="Profile banner"
          />
        </div>
        <div className="profile-identity">
          <Avatar
            person={{ ...user, image: avatar }}
            className="profile-avatar"
          />
          <button
            className="button secondary profile-edit-button"
            onClick={() => setEdit(!edit)}
          >
            Edit profile
          </button>
          <h2>{user.name}</h2>
          <span className="profile-handle">{user.handle}</span>
          {user.bio && <p className="profile-bio">{user.bio}</p>}
          {user.affiliation && (
            <p className="profile-affiliation">{user.affiliation}</p>
          )}
          <div className="profile-contact">
            {(user.contact || user.email) && (
              <span>{user.contact || user.email}</span>
            )}
          </div>
          <div className="profile-stats">
            <span>
              <strong>{user.followers || 0}</strong> followers
            </span>
            <span>
              <strong>{user.following || 0}</strong> following
            </span>
          </div>
        </div>
      </section>

      {edit && (
        <form className="profile-edit card" onSubmit={save}>
          <div className="section-heading">
            <h2>Edit profile</h2>
            <span>PROFILE DETAILS</span>
          </div>
          <label className="upload-link">
            Change profile photo
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(event) =>
                readImage(event.target.files?.[0], setAvatar, notify)
              }
            />
          </label>
          <label className="upload-link">
            Change banner
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(event) =>
                readImage(event.target.files?.[0], setBanner, notify)
              }
            />
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            maxLength={80}
            required
          />
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="A short bio"
            maxLength={180}
          />
          <input
            value={affiliation}
            onChange={(event) => setAffiliation(event.target.value)}
            placeholder="College or company"
            maxLength={120}
          />
          <input
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            placeholder={user.email || "Contact info"}
            maxLength={180}
          />

          <div className="profile-edit-group" id="profile-edit-experience">
            <div className="section-heading">
              <h3>Experience</h3>
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  setExperience([...experience, { ...emptyExperience }])
                }
              >
                ＋ Add
              </button>
            </div>
            {experience.map((item, index) => (
              <div className="profile-entry-edit" key={`experience-${index}`}>
                <input
                  value={item.role || ""}
                  onChange={(event) =>
                    updateList(
                      setExperience,
                      experience,
                      index,
                      "role",
                      event.target.value,
                    )
                  }
                  placeholder="Role"
                />
                <input
                  value={item.organization || ""}
                  onChange={(event) =>
                    updateList(
                      setExperience,
                      experience,
                      index,
                      "organization",
                      event.target.value,
                    )
                  }
                  placeholder="Company or organization"
                />
                <input
                  value={item.period || ""}
                  onChange={(event) =>
                    updateList(
                      setExperience,
                      experience,
                      index,
                      "period",
                      event.target.value,
                    )
                  }
                  placeholder="Dates"
                />
                <input
                  value={item.location || ""}
                  onChange={(event) =>
                    updateList(
                      setExperience,
                      experience,
                      index,
                      "location",
                      event.target.value,
                    )
                  }
                  placeholder="Location"
                />
                <button
                  type="button"
                  className="text-button danger"
                  onClick={() =>
                    setExperience(experience.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="profile-edit-group" id="profile-edit-education">
            <div className="section-heading">
              <h3>Education</h3>
              <button
                type="button"
                className="text-button"
                onClick={() =>
                  setEducation([...education, { ...emptyEducation }])
                }
              >
                ＋ Add
              </button>
            </div>
            {education.map((item, index) => (
              <div className="profile-entry-edit" key={`education-${index}`}>
                <input
                  value={item.school || ""}
                  onChange={(event) =>
                    updateList(
                      setEducation,
                      education,
                      index,
                      "school",
                      event.target.value,
                    )
                  }
                  placeholder="College or school"
                />
                <input
                  value={item.degree || ""}
                  onChange={(event) =>
                    updateList(
                      setEducation,
                      education,
                      index,
                      "degree",
                      event.target.value,
                    )
                  }
                  placeholder="Degree or program"
                />
                <input
                  value={item.period || ""}
                  onChange={(event) =>
                    updateList(
                      setEducation,
                      education,
                      index,
                      "period",
                      event.target.value,
                    )
                  }
                  placeholder="Dates"
                />
                <button
                  type="button"
                  className="text-button danger"
                  onClick={() =>
                    setEducation(education.filter((_, i) => i !== index))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="profile-edit-group" id="profile-edit-skills">
            <div className="section-heading">
              <h3>Skills</h3>
              <span>SEPARATE WITH COMMAS</span>
            </div>
            <input
              id="profile-skills-input"
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
              placeholder="JavaScript, Robotics, UI design"
            />
          </div>
          <div className="profile-edit-actions">
            <button className="button primary">Save profile</button>
            <button
              type="button"
              className="button secondary"
              onClick={() => setEdit(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="profile-section card profile-activity">
        <div className="section-heading">
          <div>
            <h2>Activity</h2>
            <span>
              {posts.length} PROJECT{posts.length === 1 ? "" : "S"}
            </span>
          </div>
          {posts.length > 1 && (
            <button
              className="carousel-next"
              aria-label="Show more projects"
              onClick={() =>
                activityTrack.current?.scrollBy({
                  left: 340,
                  behavior: "smooth",
                })
              }
            >
              →
            </button>
          )}
        </div>
        {posts.length ? (
          <div
            className="activity-track"
            ref={activityTrack}
            aria-label="Your project posts"
          >
            {posts.map((post) => (
              <article className="activity-project" key={post.id}>
                <img
                  src={image(post.image || "project-workbench.png")}
                  alt={post.title}
                />
                <div className="activity-project-copy">
                  <p>{post.text || post.title}</p>
                  {post.location && (
                    <span className="university">{post.location}</span>
                  )}
                  <div className="activity-project-stats">
                    <span>Likes {post.likes || 0}</span>
                    <span>Comments {post.comments || 0}</span>
                    <span>Saved {post.saves || 0}</span>
                  </div>
                  <button
                    className="text-button danger"
                    onClick={async () => {
                      if (!confirm("Delete this project?")) return;
                      try {
                        await api(`/projects/${post.id}`, { method: "DELETE" });
                        await refresh();
                        notify("Project deleted");
                      } catch (error) {
                        notify(error.message);
                      }
                    }}
                  >
                    Delete project
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="profile-empty">Your projects will show here.</p>
        )}
      </section>

      <section className="profile-section card">
        <div className="section-heading">
          <h2>Experience</h2>
          <button
            className="text-button"
            type="button"
            onClick={() => openEditor("experience")}
          >
            ＋ Add
          </button>
        </div>
        {user.experience?.length ? (
          user.experience.map((item, index) => (
            <article
              className="profile-entry"
              key={`profile-experience-${index}`}
            >
              <div className="entry-mark">
                {(item.organization || item.role || "W")
                  .slice(0, 1)
                  .toUpperCase()}
              </div>
              <div>
                <h3>{item.role}</h3>
                <p>{item.organization}</p>
                <span>
                  {[item.period, item.location].filter(Boolean).join(" · ")}
                </span>
              </div>
            </article>
          ))
        ) : (
          <p className="profile-empty">
            Add your work, projects, or volunteer experience.
          </p>
        )}
      </section>

      <section className="profile-section card">
        <div className="section-heading">
          <h2>Education</h2>
          <button
            className="text-button"
            type="button"
            onClick={() => openEditor("education")}
          >
            ＋ Add
          </button>
        </div>
        {user.education?.length ? (
          user.education.map((item, index) => (
            <article
              className="profile-entry"
              key={`profile-education-${index}`}
            >
              <div className="entry-mark">
                {(item.school || "S").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h3>{item.school}</h3>
                <p>{item.degree}</p>
                <span>{item.period}</span>
              </div>
            </article>
          ))
        ) : (
          <p className="profile-empty">
            Add your school, college, or training program.
          </p>
        )}
      </section>

      <section className="profile-section card">
        <div className="section-heading">
          <div>
            <h2>Skills</h2>
            <span>{user.skills?.length || 0} SKILLS</span>
          </div>
          <button
            className="text-button"
            type="button"
            onClick={() => openEditor("skills")}
          >
            ＋ Add
          </button>
        </div>
        {user.skills?.length ? (
          <div className="profile-skills">
            {user.skills.map((skill) => (
              <span className="skill-chip" key={skill}>
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="profile-empty">Add skills you use in your projects.</p>
        )}
      </section>

      <section className="profile-section card">
        <div className="section-heading">
          <h2>Joined events</h2>
        </div>
        {events.length ? (
          events.map((event) => (
            <p className="joined-event" key={event.id}>
              {event.title} · {event.location}
            </p>
          ))
        ) : (
          <p className="profile-empty">Events you join will show here.</p>
        )}
      </section>

      <section className="profile-account-settings card">
        <div className="account-profile-summary">
          <div className="account-clerk-menu" aria-label="Clerk account menu">
            <UserButton />
          </div>
          <div>
            <span className="account-section-label">YOUR ACCOUNT</span>
            <h2>{user.name}</h2>
            <p>{user.email || user.handle}</p>
          </div>
        </div>
        <div className="profile-account-actions">
          <button
            className="button secondary account-more-details"
            onClick={() => openUserProfile()}
          >
            More details <span aria-hidden="true">↗</span>
          </button>
        </div>
      </section>
    </div>
  );
}
