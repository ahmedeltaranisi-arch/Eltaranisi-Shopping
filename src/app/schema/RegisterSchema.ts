import * as zod from "zod";

export const schema = zod
  .object({
    // Name
    name: zod
      .string()
      .nonempty("Name is required")
      .min(3, "Min 3 letters (e.g., Alex)")
      .max(15, "Max 15 letters"),

    // Email
    email: zod
      .string()
      .nonempty("Email is required")
      .email("Invalid email format (e.g., user@example.com)"),

    // Egyptian Phone Number
    phone: zod
      .string()
      .nonempty("Phone number is required")
      .regex(
        /^(?:\+20|0020|0)?1[0125]\d{8}$/,
        "Invalid Egyptian Phone number (e.g., 01012345678)",
      ),

    // Password
    password: zod
      .string()
      .nonempty("Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
        "Password must contain both letters and numbers (e.g., User1234)",
      ),

    // Confirm Password
    rePassword: zod.string().nonempty("Please confirm your password"),
  })
  .refine((obj) => obj.password === obj.rePassword, {
    path: ["rePassword"],
    message: "Passwords do not match",
  });
