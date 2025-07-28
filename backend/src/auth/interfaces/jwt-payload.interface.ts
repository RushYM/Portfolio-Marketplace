export interface JwtPayload {
  sub: string; // User ID
  email: string;
  username: string;
  iat?: number; // Issued at
  exp?: number; // Expires at
} 