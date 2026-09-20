"use server";
import { schemaLogin } from "../schema/LoginSchema";
import * as zod from "zod";

type loginData = zod.infer<typeof schemaLogin>;

export async function userLogin(data: loginData) {
  try {
    const response = await fetch(
      `https://ecommerce.routemisr.com/api/v1/auth/signin`,
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

    return {
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      token: payload.token,
      user: payload.user,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "فشل الاتصال بالسيرفر" };
  }
}
