import express, { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { UserService } from "./modules/user/user.service";
import { makeUserRouter } from "./routes/user.router";

export const makeApp = (userService: UserService) => {
  const app = express();

  app.use(express.json());

  app.use("/", makeUserRouter(userService));

  app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
  });

  app.use((req, res) => {
    res.status(404).send({ message: "Not Found KaKA" });
  });

  const errorHandling: ErrorRequestHandler = (error, req, res, next) => {
    if (error instanceof ZodError) {
      res.status(400).send({ message: error.message });
    }
    res.status(500);
  };

  app.use(errorHandling);

  return app;
};
