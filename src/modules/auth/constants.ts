import { randomBytes } from "crypto";

// Générer un secret aléatoire de la longueur souhaitée (par exemple, 64 octets pour un secret fort)
const secretLength = 64;
const randomSecret = randomBytes(secretLength).toString('hex');

export const jwtConstants = {
  secret: randomSecret,
};