import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config";

export interface User {
  id: string;
  name: string;
  password: string;
}

export async function comparePassword({
  hash,
  password,
}: {
  hash: string;
  password: string;
}) {
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch;
}

export function createToken(id: string) {
  return jwt.sign(id, config.secret);
}

export function isBearerValid(bearer?: string) {
  if (!bearer) {
    return false;
  }

  const [type, token] = bearer.split(" ");

  if (type.toLowerCase() !== "bearer") {
    return false;
  }

  try {
    jwt.verify(token, config.secret);
  } catch (err) {
    return false;
  }

  return true;
}
