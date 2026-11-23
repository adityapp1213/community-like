import { image, initials } from "../utils.js";

export default function Avatar({ person, className = "" }) {
  return person?.image ? (
    <img
      className={`avatar ${className}`}
      src={person.image.startsWith("http") ? person.image : image(person.image)}
      alt=""
    />
  ) : (
    <span className={`avatar avatar-fallback ${className}`}>
      {initials(person?.name)}
    </span>
  );
}
