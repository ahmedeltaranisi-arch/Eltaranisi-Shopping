"use server";
import { userData } from "../schema/RegisterSchema";

export async function userRegister(data: userData) {
  try {
    const response = await fetch(
      `https://ecommerce.routemisr.com/api/v1/auth/signup`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const payload = await response.json();
    console.log("payload", payload);

    if (!response.ok) {
      return {
        success: false,
        message: payload.message || "حدث خطأ غير معروف",
      };
    }

    return { success: true, message: " Account created successfully  " };
  } catch (error) {
    console.log(error);
    return { success: false, message: "فشل الاتصال بالسيرفر" };
  }
}

// Login


