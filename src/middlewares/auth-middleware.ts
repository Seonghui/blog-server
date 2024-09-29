import { Response, Request, NextFunction } from "express";
import { JWTUser, verifyAccessToken } from "../utils/jwt";
import { TokenExpiredError } from "jsonwebtoken";
import HttpError from "../models/http-error";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token || !token?.length) {
      throw new HttpError("인증 헤더가 없습니다.", 404);
    }

    const response = verifyAccessToken(token ?? "") as JWTUser;

    if (!response.email || !response.id) {
      throw new HttpError("유저 정보가 없습니다.", 404);
    }

    req.userData = { userId: response.id };
    next();
  } catch (error: unknown) {
    if (error instanceof TokenExpiredError) {
      return next(new HttpError("엑세스 토큰이 만료되었습니다.", 401));
    }
    if (error instanceof HttpError) {
      return next(
        new HttpError(
          error.message ?? "인증 에러가 발생했습니다.",
          error.code ?? 500
        )
      );
    }
    return next(new HttpError("인증 에러가 발생했습니다.", 500));
  }
}
