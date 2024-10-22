"use client";
import axios from "axios";
import { getToken } from "@/lib/data/token";

export interface TaskEntry {
  client_id?: number;
  department_id?: number;
  commercial_id?: number;
  dim_lx_lh?: string;
  dim_square?: string;
  dim_plate?: string;
  paper_type?: string;
  pose_number?: string;
  part?: string;
  observations?: string[];
  user_id?: number;
  code?: string;
  reference?: string;
}

export async function getTasks() {
  const token = await getToken();
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/tasks`,
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

export async function endAndAssignTask(
  taskId: number,
  entry: { reason: string; note: string; user_id: number }
) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}/complete`,
      { ...entry },
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
    //console.log("error", error);
    return { success: false };
  }
}
export async function endTask(taskId: number, entry: { reason: string }) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}/complete-without-assignation`,
      { ...entry },
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
    //console.log("error", error);
    return { success: false };
  }
}
