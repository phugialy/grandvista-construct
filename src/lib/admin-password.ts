import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

export function hashAdminPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const passwordHash = scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return {
    passwordHash,
    passwordSalt: salt,
  };
}

export function verifyAdminPassword({
  password,
  passwordHash,
  passwordSalt,
}: {
  password: string;
  passwordHash: string;
  passwordSalt: string;
}) {
  const expected = Buffer.from(passwordHash, "hex");
  const actual = scryptSync(password, passwordSalt, KEY_LENGTH);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
