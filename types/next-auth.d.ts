import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "ADMIN" | "RECECIONISTA" | "DOUTOR";
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "RECECIONISTA" | "DOUTOR";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "RECECIONISTA" | "DOUTOR";
  }
}


