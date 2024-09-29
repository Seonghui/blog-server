const express = require("express");
const HttpError = require("../models/http-error");
const { check } = require("express-validator");

const postsControllers = require("../controllers/posts-controllers");

const router = express.Router();

router.get("/", postsControllers.getPosts);
router.post(
  "/",
  [check("title").not().isEmpty(), check("content").not().isEmpty()],
  postsControllers.createPosts
);
router.get("/:id", postsControllers.getPostById);
router.patch("/:id", postsControllers.updatePost);
router.delete("/:id", postsControllers.deletePost);

module.exports = router;
