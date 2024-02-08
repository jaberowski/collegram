import express, { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { UserService } from "./modules/user/user.service";
import { makeUserRouter } from "./routes/user.router";
import { DataSource } from "typeorm";
import { UserRepository } from "./modules/user/user.repository";

export const makeApp = (dataSource: DataSource) => {
  const app = express();

  app.use(express.json());

  const userRepo = new UserRepository(dataSource);
  const userService = new UserService(userRepo);

  app.use("/", makeUserRouter(userService));

  app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
  });

  app.use((req, res) => {
    res.status(404).send({ message: "Not Found KaKA" });
  });

  const errorHandling: ErrorRequestHandler = (error, req, res, next) => {
    console.log("here");
    if (error instanceof ZodError) {
      res.status(400).send({ message: error.message });
      return;
    }
    res.status(500).send();
    return;
  };

  app.use(errorHandling);

  return app;
};
