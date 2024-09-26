const uuid = require("uuid");
const HttpError = require("../models/http-error");

let DUMMY_POSTS = [
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

const getPosts = (req, res, next) => {
  res.json({ posts: DUMMY_POSTS });
};

const getPostById = (req, res) => {
  const postsId = req.params.id;
  const post = DUMMY_POSTS.find((item) => {
    return item.id === postsId;
  });

  if (!post) {
    throw new HttpError("게시글을 찾을 수 없습니다.", 404);
  }

  res.json({ post });
};

const createPosts = (req, res, next) => {
  const { title, tags, date, author, content } = req.body;
  // const title = req.body.title;
  const createdPost = {
    id: uuid.v4(),
    title,
    tags,
    date,
    author,
    content,
  };

  DUMMY_POSTS.push(createdPost);

  res.status(201).json({ post: createdPost });
};

const updatePost = (req, res, next) => {
  const { title, content, tags } = req.body;
  const postId = req.params.id;

  const updatedPost = { ...DUMMY_POSTS.find((item) => item.id === postId) };
  const postsIndex = DUMMY_POSTS.findIndex((item) => item.id === postId);
  updatedPost.title = title;
  updatedPost.content = content;

  DUMMY_POSTS[postsIndex] = updatedPost;

  res.status(200).json({ post: updatedPost });
};

const deletePost = (req, res, next) => {
  const postId = req.params.id;
  DUMMY_POSTS = DUMMY_POSTS.filter((item) => item.id !== postId);
  res.status(200).json({ message: "게시글이 삭제되었습니다." });
};

exports.getPostById = getPostById;
exports.createPosts = createPosts;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
exports.getPosts = getPosts;
