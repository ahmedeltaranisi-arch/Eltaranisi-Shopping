"use server";

import { userData } from "../schema/RegisterSchema";
import { API_V1, ApiError, serverFetch } from "@/lib/api";

export type RegisterResult = {
  success: boolean;
  message: string;
};

export async function userRegister(data: userData): Promise<RegisterResult> {
  try {
    await serverFetch<Record<string, unknown>>(`${API_V1}/auth/signup`, {
      method: "POST",
      body: data,
    });
    return { success: true, message: "Account created successfully" };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "فشل الاتصال بالسيرفر" };
  }
}
