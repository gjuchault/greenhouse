import { validate as validateUuid } from "uuid";
import ms from "ms";

export function isDateValid(input: string | Date) {
  if (isNaN(new Date(input).getTime())) {
    return false;
  }

  return true;
}

export function isMsValid(input: string) {
  return ms(input) !== undefined;
}

export function isUuidValid(input: string) {
  return validateUuid(input);
}
