const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const HttpError = require("../models/http-error");

const prisma = new PrismaClient();

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await prisma.user.findMany();
  } catch (err) {
    const error = new HttpError("유저를 불러오는데 실패했습니다.", 500);
    return next(error);
  }
  res.json({ users });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("유효하지 않은 입력입니다.", 422));
  }

  const { username, email, password, github_id, avatar } = req.body;

  let existingUser;
  try {
    existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
  } catch (err) {
    const error = new HttpError(
      "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "이미 존재하는 이메일입니다. 다른 이메일을 사용해주세요.",
      422
    );
    return next(error);
  }

  // 비밀번호 암호화
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "사용자를 생성할 수 없습니다. 다시 시도해주세요.",
      500
    );
    return next(error);
  }

  let createdUser;
  try {
    createdUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword, // 암호화된 비밀번호 저장
        github_id,
        avatar,
      },
    });
  } catch (err) {
    const error = new HttpError(
      "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.",
      500
    );
    return next(error);
  }

  res.status(201).json({ user: createdUser });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
  } catch (err) {
    const error = new HttpError(
      "로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "이메일을 찾을 수 없습니다. 다시 확인해주세요.",
      401
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "로그인에 실패했습니다. 다시 시도해주세요.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "비밀번호가 일치하지 않습니다. 다시 확인해주세요.",
      401
    );
    return next(error);
  }

  res.json({ user: existingUser });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
