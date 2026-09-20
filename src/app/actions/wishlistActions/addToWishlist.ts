"use server";

import { getTokenFun } from "@/utilites/getTokenDate";

export async function addToWishlist(prodId: string) {
  const token = await getTokenFun();
  if (!token) {
    throw new Error("Unauthorized");
  }

  try {
    const response = await fetch(
      `https://ecommerce.routemisr.com/api/v1/wishlist`,
      {
        method: "POST",
        body: JSON.stringify({
          productId: prodId,
        }),
        headers: {
          token: token as string,
          "Content-type": "application/json",
        },
      },
    );

    if (!response.ok) throw new Error("Unauthorized");

    const payload = await response.json();
    return payload;
  } catch (error) {
    throw new Error("Unauthorized");
  }
}
