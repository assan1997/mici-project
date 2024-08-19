import { NextResponse } from "next/server";
import { getToken } from "./lib/data/token";
import axios from "axios";

export async function middleware(request: Request) {
  const url = new URL(request.url);
  try {
    const token = await getToken();

    if (url.pathname !== "/") {
      const {
        data: { data },
      } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/get-current-user`,
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return NextResponse.next();
    }
  } catch (error: any) {
    return NextResponse.redirect(new URL(`/`, request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|assets|auth|.*\\.png$).*)"],
};
