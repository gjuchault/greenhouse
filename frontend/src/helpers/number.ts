export function isValidInteger(input: string) {
  return Number.isFinite(Number(input)) && !input.includes("e");
}
