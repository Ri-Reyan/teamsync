import { Package, PlatformRole } from "../generated/prisma/enums.js";

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email: string;
      platformRole: PlatformRole;
      isPremium: boolean;
      package: Package;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
