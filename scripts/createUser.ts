import type UserRepository from "../src/repositories/UserRepository";
import { getServiceLocator, hashPassword } from "../src/utils";

export async function createUser({ name, username, password }: any) {
      const userRepo =
            getServiceLocator().resolve<UserRepository>("UserRepository");
      const user = {
            name,
            username,
            password: await hashPassword(password),
            role: "admin",
      } as any;
      return await userRepo.create(user);
}
