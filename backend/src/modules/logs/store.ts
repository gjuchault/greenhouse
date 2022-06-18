export const store: [Date, string, string][] = [];

export function append({
  service,
  message,
}: {
  service: string;
  message: string;
}) {
  const date = new Date();
  store.push([date, service, message]);

  if (store.length > 5000) {
    store.shift();
  }
}
