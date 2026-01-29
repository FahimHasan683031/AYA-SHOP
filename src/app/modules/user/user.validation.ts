import { z } from "zod";
import { USER_ROLES, USER_STATUS } from "./user.interface";

export const userSignupSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    fullName: z.string().min(1, "Full name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.nativeEnum(USER_ROLES).optional(),
  })
});

export const userLoginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    password: z.string().min(1, "Password is required"),
  })
});

export const userUpdateSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").trim().toLowerCase().optional(),
    fullName: z.string().min(1, "Full name is required").optional(),
    image: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    status: z.nativeEnum(USER_STATUS).optional(),
    verified: z.boolean().optional()
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  })
});

const timeStringSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
  message: 'Invalid time format. Expected "HH:mm" in 24-hour format.',
});

export const updateBusinessSchema = z.object({
  body: z.object({
    businessName: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    yearsInBusiness: z.number().optional(),
    employeesCount: z.number().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    website: z.string().optional(),
    logo: z.string().optional(),
    photos: z.array(z.string()).max(10).optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    businessHours: z.object({
      monday: z.object({ from: timeStringSchema, to: timeStringSchema }),
      tuesday: z.object({ from: timeStringSchema, to: timeStringSchema }),
      wednesday: z.object({ from: timeStringSchema, to: timeStringSchema }),
      thursday: z.object({ from: timeStringSchema, to: timeStringSchema }),
      friday: z.object({ from: timeStringSchema, to: timeStringSchema }),
      saturday: z.object({ from: timeStringSchema, to: timeStringSchema }),
      sunday: z.object({ from: timeStringSchema, to: timeStringSchema }),
    }).optional(),
  })
});

export const UserValidations = {
  userSignupSchema,
  userLoginSchema,
  userUpdateSchema,
  changePasswordSchema,
  updateBusinessSchema,
};
