export const fallback = {
  users: [],
  posts: [],
  events: [],
  activity: { likes: [], saved: [], events: [], friends: [], following: [] },
};

export const image = (name) => {
  if (!name) return "";
  if (name.startsWith("data:") || name.startsWith("http")) return name;
  return `/assets/${name.replace(/^assets\//, "")}`;
};

export const initials = (name = "Member") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const localDateTime = (value) => {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};
