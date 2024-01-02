import { Response } from "express";
import { HttpError } from "./http-error";

export const handleExpress = async <A>(res: Response, fn: () => Promise<A>) => {
  try {
    const data = await fn();
    res.status(200).send(data);
    return;
  } catch (e) {
    if (e instanceof HttpError) {
      res.status(e.status).send({ message: e.message });
      return;
    }
    res.status(500).send();
    return;
  }
};
