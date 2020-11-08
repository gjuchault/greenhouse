import { validate as validateUuid } from "uuid";

export function isDateValid(input: string | Date) {
  if (isNaN(new Date(input).getTime())) {
    return false;
  }

  return true;
}

export function isUuidValid(input: string) {
  return validateUuid(input);
}
