import jwt from "jsonwebtoken";

export function getUserIdFromToken(token: string) {
    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
    ) as { userId: string };

    return decoded.userId;
}