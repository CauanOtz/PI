import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

export default { signToken, verifyToken };
