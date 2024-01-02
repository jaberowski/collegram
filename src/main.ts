import { makeApp } from "./api";
import { Identifier } from "./modules/user/model/identifier";
import { Password } from "./modules/user/model/password";
import { UserRepository } from "./modules/user/user.repository";
import { UserService } from "./modules/user/user.service";

const PORT = 3000;

const userRepo = new UserRepository();
const userService = new UserService(userRepo);
const app = makeApp(userService);

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
