"use server";

import { cookies } from "next/headers";
import axios from "axios";
import { getToken } from "@/lib/data/token";
export async function login(values: { email: string; password: string }) {
  try {
    const {
      data: { accessToken, data },
    } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, values);
    cookies().set("authToken", accessToken);
    return { success: true, data };
  } catch (error) {
    return { success: false };
  }
}

export async function refreshUser() {
  const token = await getToken();
  try {
    const {
      data: { data },
    } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/get-current-user`, {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, data };
  } catch (error) {
    return { success: false };
  }
}

// direct signup
// export const emailInvitation = async (email: string) => {
//   try {
//     const {
//       data: { token, user },
//     } = await axios.post(
//       `${process.env.NEXT_PUBLIC_API_URL}/auth/direct-signup-step-one`,
//       { email },
//       {
//         headers: {
//           accept: "application/json",
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     cookies().set("authToken", token);
//     return user;
//   } catch (error: any) {
//     if (axios.isAxiosError(error)) {
//       console.log("error", error?.response?.data);
//       return { inUsedError: error?.response?.data };
//     } else return {};
//   }
// };

// export const completeCreateUser = async (data: {
//   fullName: string;
//   password: string;
// }) => {
//   const token = await getToken();
//   try {
//     const {
//       data: { user },
//     } = await axios.put(
//       `${process.env.NEXT_PUBLIC_API_URL}/auth/direct-signup-finish`,
//       data,
//       {
//         headers: {
//           accept: "application/json",
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     return { user };
//   } catch (error) {
//     console.log("error", error);
//     return {};
//   }
// };

//logout

export async function logout() {
  try {
    cookies().delete("authToken");
    return true;
  } catch (error: unknown) {
    return { error: error };
  }
}
