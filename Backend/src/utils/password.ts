// src/utils/password.ts
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12; // Docs spec: 12 work factor

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}