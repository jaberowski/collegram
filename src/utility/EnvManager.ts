import { TypeOf, ZodError, z } from "zod";

const zodEnv = z.object({
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3000),
  x: z.optional(z.number()),
});

// TODO: check if using singleton is a good idea in this case
export class EnvManager {
  private parsedEnv!: z.infer<typeof zodEnv>;
  private constructor() {
    try {
      this.parsedEnv = zodEnv.parse(process.env);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error("env failed validation");
      }
    }
  }
  public static initialize() {
    return new this();
  }

  public get<A extends keyof z.infer<typeof zodEnv>>(name: A) {
    return this.parsedEnv[name];
  }

  public getRequired<A extends keyof z.infer<typeof zodEnv>>(name: A) {
    const result = this.parsedEnv[name];
    if (!result) {
      throw new Error("enviroment variable not provided");
    }
    return result;
  }
}
