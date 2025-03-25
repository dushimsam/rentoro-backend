export interface JwtPayload {
    sub: string; // subject (user id)
    email: string;
    roles?: string[];
    iat?: number; // issued at
    exp?: number; // expiration
  }