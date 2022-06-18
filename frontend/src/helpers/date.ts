export function formatDate(input: Date | string, precise: boolean = false) {
  return new Date(input).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: precise ? "numeric" : undefined,
  });
}

const formatter = new Intl.RelativeTimeFormat("fr-FR", {
  numeric: "auto",
});

const divisions: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Number.POSITIVE_INFINITY, name: "years" },
];

export function formatDistance(to: Date | string) {
  let duration = (new Date(to).getTime() - Date.now()) / 1000;

  for (let i = 0; i <= divisions.length; i++) {
    const division = divisions[i];
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }
}
