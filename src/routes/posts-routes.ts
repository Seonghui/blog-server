import { Router } from "express";
import { check } from "express-validator";
import HttpError from "../models/http-error";
import * as postsControllers from "../controllers/posts-controllers";
import { authMiddleware } from "../middlewares/auth-middleware";

const router = Router();

router.get("/", postsControllers.getPosts);

router.post(
  "/",
  authMiddleware,
  [check("title").not().isEmpty(), check("content").not().isEmpty()],
  postsControllers.createPosts
);

router.get("/:id", postsControllers.getPostById);

router.patch("/:id", postsControllers.updatePost);

router.delete("/:id", postsControllers.deletePost);

export default router;
