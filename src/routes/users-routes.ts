import { Router } from "express";
import { check } from "express-validator";

import * as usersController from "../controllers/users-controllers";

const router = Router();

router.get("/", usersController.getUsers);

router.post(
  "/signup",
  [
    check("username").not().isEmpty(),
    check("password").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

router.post("/refresh-token", usersController.refreshAccessToken);

export default router;
