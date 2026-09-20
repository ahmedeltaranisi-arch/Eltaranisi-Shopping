import * as zod from "zod";

export const schemaLogin = zod.object({
  // Email
  email: zod
    .string()
    .nonempty("Email is required")
    .email("Invalid email format (e.g., ahmedemksmk@gmail.com)"),

  // Password
  password: zod
    .string()
    .nonempty("Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
      "Password must contain both letters and numbers (e.g., User1234)",
    ),
});
