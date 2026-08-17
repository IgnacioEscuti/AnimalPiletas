import bcrypt from "bcryptjs";

export async function createHash(pin) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pin, salt);
}

export async function isValidPin(pin, hash) {
  return bcrypt.compare(pin, hash);
}
