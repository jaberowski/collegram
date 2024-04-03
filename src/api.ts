import express, { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { UserService } from "./modules/user/user.service";
import { makeUserRouter } from "./routes/user.router";
import { DataSource } from "typeorm";
import { UserRepository } from "./modules/user/user.repository";
import { UploadError } from "./routes/middlewares/upload.middleware";

export const makeApp = (dataSource: DataSource) => {
  const app = express();

  app.use(express.json());

  const userRepo = new UserRepository(dataSource);
  const userService = new UserService(userRepo);

  app.use("/", makeUserRouter(userService));
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
