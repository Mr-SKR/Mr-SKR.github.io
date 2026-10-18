/** A tiny hand-drawn stroke icon set, so the page needs no icon font. */
const PATHS: Record<string, string> = {
  undo: "M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  left: "m15 18-6-6 6-6",
  right: "m9 18 6-6-6-6",
  down: "m6 9 6 6 6-6",
  grip: "M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01",
  copy: "M8 8h11v11H8zM5 16V5h11",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  x: "M18 6 6 18M6 6l12 12",
  plus: "M12 5v14M5 12h14",
  share: "M4 12v7h16v-7M12 3v13M7 8l5-5 5 5",
  download: "M12 3v13M7 11l5 5 5-5M4 21h16",
  info: "M12 8h.01M11 12h1v5h1",
  arrow: "M5 12h14M13 6l6 6-6 6",
  split: "M4 6h16M4 12h10M4 18h16",
  up: "m18 15-6-6-6 6",
  check: "m5 12 5 5 9-10",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  walk: "M13 4a1 1 0 1 0 0 .01M10 21l2-6 3 3v3M9 12l2-4 4 2 2 3M11 8l-2 5",
};

export function Icon({ name, size = 18, title }: { name: keyof typeof PATHS | string; size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {name === "info" && <circle cx="12" cy="12" r="9" />}
      <path d={PATHS[name] || ""} />
    </svg>
  );
}
