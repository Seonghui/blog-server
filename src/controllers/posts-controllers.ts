import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import HttpError from "../models/http-error";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

// 게시물 전체 조회
const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  let posts;
  try {
    posts = await prisma.post.findMany({
      include: {
        author: true,  // 게시물 작성자 정보 포함
      },
    });
  } catch (err) {
    console.log(err)
    const error = new HttpError("게시물을 불러오는데 실패했습니다.", 500);
    return next(error);
  }
  return res.json({ posts });
};

// ID로 게시물 조회
const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.id;

  let post;
  try {
    post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
      },
    });
  } catch (err) {
    const error = new HttpError("게시물을 찾을 수 없습니다.", 500);
    return next(error);
  }

  if (!post) {
    const error = new HttpError("해당 게시물이 없습니다.", 404);
    return next(error);
  }

  res.json({ post });
};

// 게시물 생성
const createPosts = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  const { userId: authorId } = req.userData

  if (!errors.isEmpty()) {
    throw new HttpError("유효하지 않은 입력입니다.", 422);
  }

  const { title, tags, content } = req.body;

  let createdPost;
  try {
    createdPost = await prisma.post.create({
      data: {
        title,
        authorId, // 유저 ID를 authorId로 연결
        content,
        tags
      },
    });
  } catch (err) {
    console.error(err)
    const error = new HttpError("게시물을 생성하는데 실패했습니다.", 500);
    return next(error);
  }

  res.status(201).json({ post: createdPost });
};

// 게시물 수정
const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  const { title, content, tags } = req.body;
  const postId = req.params.id;

  let updatedPost;
  try {
    updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        tags
      },
      include: {
        author: true,
      },
    });
  } catch (err) {
    console.log(err)
    const error = new HttpError("게시물을 업데이트할 수 없습니다.", 500);
    return next(error);
  }

  res.status(200).json({ post: updatedPost });
};

// 게시물 삭제
const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.id;

  try {
    await prisma.post.delete({
      where: { id: postId },
    });
  } catch (err) {
    const error = new HttpError("포스트를 삭제하는데 실패했습니다.", 500);
    return next(error);
  }

  res.status(200).json({ message: "게시글이 삭제되었습니다." });
};

// 모듈 내보내기
export { getPosts, getPostById, createPosts, updatePost, deletePost };
