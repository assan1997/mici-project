"use client";
import axios from "axios";
import { getToken } from "@/lib/data/token";

export interface FolderEntry {
  client_id?: number;
  department_id?: number;
  commercial_id?: number;
  product_id?: number;
  shape_id?: number;
  fabrication_id?: number;
  file_number?: string;
  format?: string;
  color?: string;
  support?: string;
  bat_id?: number;
  details?: string;
  state?: string;
  user_id?: string;
}

// OFFSET
export async function createFolder(entry: FolderEntry) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/folders`,
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
export async function getAllFolders() {
  const token = await getToken();
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/folders`,
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
export async function deleteFolder(id: number) {
  const token = await getToken();
  //console.log("id", id);
  //console.log("token", token);
  try {
    const {
      data: { message },
    } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/folders/${id}/delete`,
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
    //console.log("error", error);
    return { success: false };
  }
}
export async function updateFolder(id: number, entry: FolderEntry) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/folders/${id}/update`,
      entry,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    //console.log("updatedUser", data);
    return { success: true, data };
  } catch (error) {
    //console.log("error", error);
    return { success: false };
  }
}
export async function standbyFolder(
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
      `${process.env.NEXT_PUBLIC_API_URL}/folders/${id}/standby`,
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
    //console.log("error", error);
    return { success: false };
  }
}
export async function observationFolder(
  id: number,
  entry: {
    type: string;
    observation: string;
  }
) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/folders/${id}/observation`,
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
    //console.log("error", error);
    return { success: false };
  }
}
export async function assignToAnUserFolder(
  id: number,
  entry: {
    type: string;
    user_id: string;
  }
) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/folders/${id}/assign`,
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
    //console.log("error", error);
    return { success: false };
  }
}
