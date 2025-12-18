import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;

  const isAuth = !!req.auth;
  const role = req.auth?.user?.role;

  // Rotas públicas
  if (nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Requer login
  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Área restrita a admin
  if (nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clientes/:path*",
    "/marcacoes/:path*",
    "/calendario/:path*",
    "/admin/:path*",
  ],
};
