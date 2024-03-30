import { Express } from "express";
import { AppDataSource } from "../data-source";
import { makeApp } from "../src/api";
import request from "supertest";
import { DataSource } from "typeorm";

describe("user", () => {
  let app: Express;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await AppDataSource.initialize();

    // const entitiesMetadata = dataSource.entityMetadatas;
    // for (const meta of entitiesMetadata) {
    //   await dataSource.query(`TRUNCATE TABLE ${meta.tableName} CASCADE`);
    // }

    app = makeApp(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  }, 3000);

  describe("create", () => {
    it("should send bad request if username is less than 4 character or more than 64 ", async () => {
      await request(app)
        .post("/signup")
        .send({
          username: "ali",
          email: "ali@gmail.com",
          password: "Test1234",
        })
        .expect(400);

      await request(app)
        .post("/signup")
        .send({
          username:
            "dlsfhakldjfhaosdlfjhfaukdsjfhauisdhfaskdljfhadsjklfnhaudskljfhalkdshfnkjalsdfnauidhfidsugifhudskjgbvdklchvajldhflia",
          email: "xczvb@gmail.com",
          password: "Test1234",
        })
        .expect(400);
    });

    it.skip("should fail creating user if username is taken", async () => {
      await request(app).post("/signup").send({
        email: "test@email.com",
        username: "username",
        password: "Password1",
      });

      const result = await request(app).post("/signup").send({
        email: "test2@email.com",
        username: "username",
        password: "Password1",
      });

      expect(result.statusCode).toBe(409);
    });

    it.skip("should fail creating user if email is taken", async () => {
      await request(app).post("/signup").send({
        email: "test@email.com",
        username: "ali",
        password: "Password1",
      });

      const result = await request(app).post("/signup").send({
        email: "test@email.com",
        username: "ali2",
        password: "Password1",
      });

      expect(result.statusCode).toBe(409);
    });
  });

  describe("login", () => {
    it("should login using email", async () => {
      await request(app)
        .post("/login")
        .send({ identifier: "j.fathi1998@gmail.com", password: "621377jF" })
        .expect(200);
    });

    it("should login using user name", async () => {
      await request(app)
        .post("/login")
        .send({ identifier: "jaberowski", password: "621377jF" })
        .expect(200);
    });

    it("should fail login using wrong password", async () => {
      await request(app)
        .post("/login")
        .send({ identifier: "jaberowski", password: "wrongpassword" })
        .expect(401);
    });
  });

  describe("info", () => {
    it("skk", async () => {
      const { body: user } = await request(app)
        .post("/signup")
        .send({
          username: "testInfo",
          email: "testInfo@gmail.com",
          password: "Test1234",
        })
        .expect(200);

      console.log("useer", user);
    });
  });
});
