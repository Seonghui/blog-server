import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { validationResult } from "express-validator";
import HttpError from "../models/http-error";

// 게시물 타입 정의
interface Post {
  id: string;
  title: string;
  tags: string[];
  date: string;
  updated_date?: string;
  author: string;
  content: string;
}

// 더미 데이터
let DUMMY_POSTS: Post[] = [
  {
    id: "p1",
    title: "포스트 1",
    tags: ["tag1", "tag2"],
    date: "2023-12-24",
    updated_date: "2023-12-24",
    author: "stella",
    content: "포스트 1 내용",
  },
];

// 게시물 전체 조회
const getPosts = (req: Request, res: Response, next: NextFunction) => {
  res.json({ posts: DUMMY_POSTS });
};

// ID로 게시물 조회
const getPostById = (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.id;
  const post = DUMMY_POSTS.find((item) => item.id === postId);

  if (!post) {
    throw new HttpError("게시글을 찾을 수 없습니다.", 404);
  }

  res.json({ post });
};

// 게시물 생성
const createPosts = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError("유효하지 않은 입력입니다.", 422);
  }

  const { title, tags, date, author, content } = req.body;

  const createdPost: Post = {
    id: uuidv4(),
    title,
    tags,
    date,
    author,
    content,
  };

  DUMMY_POSTS.push(createdPost);

  res.status(201).json({ post: createdPost });
};

// 게시물 수정
const updatePost = (req: Request, res: Response, next: NextFunction) => {
  const { title, content, tags } = req.body;
  const postId = req.params.id;

  const updatedPost = { ...DUMMY_POSTS.find((item) => item.id === postId) } as Post;
  const postsIndex = DUMMY_POSTS.findIndex((item) => item.id === postId);

  if (!updatedPost) {
    throw new HttpError("게시글을 찾을 수 없습니다.", 404);
  }

  updatedPost.title = title;
  updatedPost.content = content;
  updatedPost.tags = tags;

  DUMMY_POSTS[postsIndex] = updatedPost;

  res.status(200).json({ post: updatedPost });
};

// 게시물 삭제
const deletePost = (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.id;
  DUMMY_POSTS = DUMMY_POSTS.filter((item) => item.id !== postId);
  res.status(200).json({ message: "게시글이 삭제되었습니다." });
};

// 모듈 내보내기
export { getPosts, getPostById, createPosts, updatePost, deletePost };
