import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export type JwtUser = {
  id: string;
  email: string;
  role: "STUDENT" | "ADMIN";
};

export function createToken(payload: JwtUser) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): JwtUser {
  return jwt.verify(token, JWT_SECRET) as JwtUser;
}