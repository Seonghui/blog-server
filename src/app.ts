import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";

import postsRoutes from "./routes/posts-routes";
import usersRoutes from "./routes/users-routes";
import HttpError from "./models/http-error";

dotenv.config();

const app = express();

app.use(bodyParser.json());

app.use("/api/posts", postsRoutes);
app.use("/api/users", usersRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error: HttpError, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

app.listen(6000, () => {
  console.log("Server is running on port 6000");
});
