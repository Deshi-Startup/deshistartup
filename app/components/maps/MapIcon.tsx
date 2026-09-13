export default function MapIcon({
  name,
}: {
  name:
    | "layers"
    | "search"
    | "close"
    | "share"
    | "arrow"
    | "info"
    | "compare"
    | "chevron"
    | "factory"
    | "anchor"
    | "gate"
    | "plane";
}) {
  const paths = {
    layers: "M12 3 2 8l10 5 10-5-10-5ZM2 12l10 5 10-5M2 16l10 5 10-5",
    search: "m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
    close: "m6 6 12 12M18 6 6 18",
    share:
      "m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    info: "M12 11v6m0-10v1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    compare: "M8 4v16M16 4v16M3 8l5-4 5 4M11 16l5 4 5-4",
    chevron: "m6 9 6 6 6-6",
    factory: "M3 21V10l6 3V7l6 4V3h4l2 18H3ZM7 17h1m4 0h1m4 0h1",
    anchor:
      "M12 7v14M5 11H2v4a10 10 0 0 0 20 0v-4h-3M8 12h8M15 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    plane:
      "M12 2c-1 0-2 2-2 4v3L2 14v2l8-2v4l-3 2v1l5-1 5 1v-1l-3-2v-4l8 2v-2l-8-5V6c0-2-1-4-2-4Z",
    gate: "M4 21V8h16v13M2 8l10-5 10 5M8 21v-7h8v7M2 21h20",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
