"use server";
import { cookies } from "next/headers";

export async function getAcessToken() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("accessToken");
    if (!accessToken) return null;
    return accessToken.value;
  } catch (error) {}
}

export async function getToken() {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get("authToken");
    if (!accessToken) return null;
    return accessToken.value;
  } catch (error) {}
}
