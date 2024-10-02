"use client";
import axios from "axios";
import { getToken } from "@/lib/data/token";

export async function getAllDepartments() {
  const token = await getToken();
  try {
    const {
      data
    } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/departments`, {
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

export async function getDepartmentById(id: number) {
  const token = await getToken();
  try {
    const {
      data
    } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/departments/${id}`,
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
