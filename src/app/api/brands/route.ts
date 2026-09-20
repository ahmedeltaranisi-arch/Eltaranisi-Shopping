// method , response
//localhost3000/api/brands

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  //Logic

  // قمت بتحويل هذا السطر لتعليق بدلاً من حذفه لأنه لا يمكن كتابة أوامر برمجية (fetch) داخل هذا الكائن
  // return NextResponse.json({

  // Logic

  // message: "success",
  // count: 5,
  // allProducts: [
  //     { name: "nokia", id: 12, price: 9000 },
  //     { name: "OPPO ", id: 13, price: 5000 },
  //     { name: "REDMI", id: 14, price: 14000 },
  //     { name: "LELMI", id: 15, price: 10000 },
  //     { name: "SONY", id: 16, price: 12000 }

  // ],

  // Logic
  const response = await fetch("https://ecommerce.routemisr.com/api/v1/brands");
  const payload = await response.json();

  return NextResponse.json(payload);

  // قمت بتحويل هذا السطر أيضاً لتعليق ليتناسب مع إغلاق القوس بالأعلى
  // });
}
