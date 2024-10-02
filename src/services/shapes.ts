"use client";
import axios from "axios";
import { getToken } from "@/lib/data/token";

export interface OffsetShapeEntry {
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
  observation?: string;
  user_id?: number;
  code?: string;
  reference?: string;
  rule_id?: number;
}

export async function getShapeDetails(shapeId: string) {
  const token = await getToken();
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/shapes/${shapeId}`,
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

export async function endShape(shapeId: number) {
  console.log("shapeId", shapeId);
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/shapes/${shapeId}/close`,
      null,
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
// OFFSET
export async function createOffsetShape(entry: OffsetShapeEntry) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/shapes`,
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
export async function getAllOffsetShapes() {
  const token = await getToken();
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/shapes`,
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
export async function deleteOffsetShape(id: number) {
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
export async function updateOffsetShape(id: number, entry: OffsetShapeEntry) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/shapes/${id}/update`,
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
export async function standbyOffsetShape(
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
      `${process.env.NEXT_PUBLIC_API_URL}/shapes/${id}/standby`,
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
export async function observationOffsetShape(
  id: number,
  entry: {
    type: string;
    observation: string;
  }
) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/shapes/${id}/observation`,
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
export async function assignToAnUserOffsetShape(
  id: number,
  entry: {
    type: string;
    user_assignated_id: number;
    task_description: string;
  }
) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/shapes/${id}/assign`,
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
// FLEXO
export async function createFlexoShape(entry: OffsetShapeEntry) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/shapes`,
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
export async function getAllFlexoShapes() {
  const token = await getToken();
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/shapes`,
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
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/shapes/${id}/delete`,
      null,
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
export async function updateFlexoShape(id: number, entry: OffsetShapeEntry) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/shapes/${id}/update`,
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
export async function standbyFlexoShape(
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
      `${process.env.NEXT_PUBLIC_API_URL}/shapes/${id}/standby`,
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
export async function observationFlexoShape(
  id: number,
  entry: {
    type: string;
    observation: string;
  }
) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/shapes/${id}/observation`,
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
export async function assignToAnUserFlexoShape(
  id: number,
  entry: {
    type: string;
    user_id: number;
  }
) {
  const token = await getToken();
  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/shapes/${id}/assign`,
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
