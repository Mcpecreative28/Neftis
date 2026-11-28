import { auth } from "@/lib/auth/server";

export default auth.middleware({
  loginUrl: "/login",
});

export const config = {
  matcher: [
    "/ai/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/admin/:path*",
  ],
};
