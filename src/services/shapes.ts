"use server";
import axios from "axios";
import { getToken } from "@/lib/data/token";

export interface ShapeEntry {
  client_id: number;
  department_id: number;
  commercial_id: number;
  dim_lx_lh: number;
  dim_square: number;
  dim_plate: number;
  paper_type: number;
  pose_number: number;
  part: number;
  observation: number;
  user_id: number;
}

export async function createShape(entry: ShapeEntry) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/`,
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
export async function getAllShapes() {
  const token = await getToken();
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/clients`,
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
export async function deleteShape(id: number) {
  const token = await getToken();
  console.log("id", id);
  console.log("token", token);
  try {
    const {
      data: { message },
    } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/clients/${id}/delete`,
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
export async function updateShape(id: number, entry: ShapeEntry) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/clients/${id}/update`,
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
