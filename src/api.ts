import express, { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { UserService } from "./modules/user/user.service";
import { makeUserRouter } from "./routes/user.router";
import { DataSource } from "typeorm";
import { UserRepository } from "./modules/user/user.repository";
import { UploadError } from "./routes/middlewares/upload.middleware";
import { UserRelationREpository } from "./modules/userRelations/userRelation.repository";
import { UserRelationService } from "./modules/userRelations/userRelation.service";
import { makePostRouter } from "./routes/post.router";
import { PostRepository } from "./modules/post/post.repository";
import { PostService } from "./modules/post/post.service";
import { authMiddleWare } from "./routes/middlewares/auth.middleware";

export const makeApp = (dataSource: DataSource) => {
  const app = express();

  app.use(express.json());

  const userRepo = new UserRepository(dataSource);
  const userService = new UserService(userRepo);

  const userRelationRepo = new UserRelationREpository(dataSource);
  const userRelationService = new UserRelationService(
    userRelationRepo,
    userRepo
  );

  const postRepo = new PostRepository(dataSource);
  const postService = new PostService(
    postRepo,
    userRelationService,
    userService
  );

  app.use("/", makeUserRouter(userService, userRelationService));
  app.use(
    "/posts",
    authMiddleWare(userService),
    makePostRouter(postService, userService)
  );
  app.use("/images", express.static("uploads"));

  app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
  });

  app.use((req, res) => {
    res.status(404).send({ message: "EndPoint Not Found" });
  });

  const errorHandling: ErrorRequestHandler = (error, req, res, next) => {
    if (error instanceof ZodError) {
      res.status(400).send({ message: error.message });
      return;
    }
    if (error instanceof UploadError) {
      res.status(error.code).send({ message: error.message });
    }
    res.status(500).send();
    return;
  };

  app.use(errorHandling);

  return app;
};
