"use client";
import axios from "axios";
import { getToken } from "@/lib/data/token";

export interface UserEntry {
  name?: string;
  email?: string;
  password?: string;
  section_ids?: number[];
  department_ids?: number[];
}
export async function createUser(entry: UserEntry) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/users`,
      entry,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return { success: true, data };
  } catch (error) {
    return { success: false };
  }
}
export async function getAllUsers() {
  const token = await getToken();
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/users`,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: true, data };
  } catch (error) {
    return { success: false };
  }
}

export async function updateUser(id: number, entry: UserEntry) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/update`,
      entry,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("updatedUser", data);
    return { success: true, data };
  } catch (error) {
    console.log("error", error);
    return { success: false };
  }
}

export async function deleteUser(id: number) {
  const token = await getToken();
  try {
    const {
      data: { message },
    } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/delete`,
      null,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return { success: true };
  } catch (error) {
    console.log("error", error);
    return { success: false };
  }
}
export async function getUser(id: string) {
  const token = await getToken();
  // https://api-mici.vooizo.com/api/users/19/show
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/show`,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("updatedUser", data);
    return { success: true, data };
  } catch (error) {
    console.log("error", error);
    return { success: false };
  }
}

export async function getUserPerformance(id: string, period: string) {
  const token = await getToken();
  // https://api-mici.vooizo.com/api/users/19/show
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/performance/${period}`,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("updatedUser", data);
    return { success: true, data };
  } catch (error) {
    console.log("error", error);
    return { success: false };
  }
}
