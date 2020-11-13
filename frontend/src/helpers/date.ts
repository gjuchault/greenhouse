export function formatDate(input: Date | string, precise: boolean = false) {
  let d = typeof input === "string" ? new Date(input) : input;

  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: precise ? "numeric" : undefined,
  });
}
