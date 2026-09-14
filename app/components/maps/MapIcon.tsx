import { mapIconPaths } from "./map-icons";

export default function MapIcon({ name }: { name: keyof typeof mapIconPaths }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={mapIconPaths[name]} />
    </svg>
  );
}
