export function initialsFor(displayName: string) {
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("");
  return initials ? initials.toUpperCase() : "?";
}
