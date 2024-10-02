"use client";
import axios from "axios";
import { getToken } from "@/lib/data/token";
export interface BatEntry {
  client_id?: number;
  department_id?: number;
  commercial_id?: number;
  product_id?: number;
  shape_id?: number;
  fabrication_id?: number;
  reference?: string;
  details?: string;
}

// OFFSET
export async function createBat(entry: BatEntry) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/bats`,
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
export async function getAllBats() {
  const token = await getToken();
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/bats`,
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
export async function deleteBat(id: number) {
  const token = await getToken();
  console.log("id", id);
  console.log("token", token);
  try {
    const {
      data: { message },
    } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/bats/${id}/delete`,
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
export async function updateBat(id: number, entry: BatEntry) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/bats/${id}/update`,
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
export async function standbyBat(
  id: number,
  entry: {
    type: string;
    reason: string;
    status_id: number;
  }
) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/bats/${id}/standby`,
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
    console.log("error", error);
    return { success: false };
  }
}
export async function observationBat(
  id: number,
  entry: {
    type: string;
    observation: string;
  }
) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/bats/${id}/observation`,
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
    console.log("error", error);
    return { success: false };
  }
}
export async function assignToAnUserBat(
  id: number,
  entry: {
    type: string;
    assignated_user: number;
  }
) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/bats/${id}/assign`,
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
    console.log("error", error);
    return { success: false };
  }
}
