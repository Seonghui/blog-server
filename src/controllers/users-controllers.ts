import { Request, Response, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import HttpError from "../models/http-error";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

const prisma = new PrismaClient();

const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  let users: User[];
  try {
    users = await prisma.user.findMany();
  } catch (err) {
    const error = new HttpError("유저를 불러오는데 실패했습니다.", 500, err);
    return next(error);
  }
  res.json({ users });
};

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("유효하지 않은 입력입니다.", 422));
  }

  const { username, email, password, github_id, avatar } = req.body as {
    username: string;
    email: string;
    password: string;
    github_id?: string;
    avatar?: string;
  };

  let existingUser: User | null;
  try {
    existingUser = await prisma.user.findUnique({
      where: { email },
    });
  } catch (err) {
    return next(
      new HttpError(
        "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        500,
        err
      )
    );
  }

  if (existingUser) {
    return next(
      new HttpError(
        "이미 존재하는 이메일입니다. 다른 이메일을 사용해주세요.",
        422
      )
    );
  }

  let hashedPassword: string;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(
      new HttpError("사용자를 생성할 수 없습니다. 다시 시도해주세요.", 500, err)
    );
  }

  let createdUser: User;
  try {
    createdUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        github_id,
        avatar,
      },
    });
  } catch (err) {
    return next(
      new HttpError("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.", 500, err)
    );
  }

  const accessToken = generateAccessToken(createdUser);
  const refreshToken = generateRefreshToken(createdUser);

  res.status(201).json({
    accessToken,
    refreshToken,
  });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as { email: string; password: string };

  let existingUser: User | null;
  try {
    existingUser = await prisma.user.findUnique({
      where: { email },
    });
  } catch (err) {
    return next(
      new HttpError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.", 500, err)
    );
  }

  if (!existingUser) {
    return next(
      new HttpError("이메일을 찾을 수 없습니다. 다시 확인해주세요.", 401)
    );
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password!);
  } catch (err) {
    return next(
      new HttpError("로그인에 실패했습니다. 다시 시도해주세요.", 500, err)
    );
  }

  if (!isValidPassword) {
    return next(
      new HttpError("비밀번호가 일치하지 않습니다. 다시 확인해주세요.", 401)
    );
  }

  const accessToken = generateAccessToken(existingUser);
  const refreshToken = generateRefreshToken(existingUser);

  res.json({
    accessToken,
    refreshToken,
  });
};

const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken } = req.body as { refreshToken: string };

  if (!refreshToken) {
    return next(new HttpError("리프레시 토큰이 제공되지 않았습니다.", 403));
  }

  let payload: any;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    return next(new HttpError("유효하지 않은 리프레시 토큰입니다.", 403));
  }

  let existingUser: User | null;
  try {
    existingUser = await prisma.user.findUnique({
      where: { id: payload.id },
    });
  } catch (err) {
    return next(new HttpError("유저를 찾을 수 없습니다.", 500, err));
  }

  if (!existingUser) {
    return next(new HttpError("유저를 찾을 수 없습니다.", 404));
  }

  const newAccessToken = generateAccessToken(existingUser);

  res.json({
    accessToken: newAccessToken,
  });
};

export { getUsers, signup, login, refreshAccessToken };
