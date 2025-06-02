import { z } from "zod";

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Brand scanning validation
export const brandScanSchema = z.object({
  brandName: z.string()
    .min(1, "Brand name is required")
    .max(100, "Brand name too long")
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, "Brand name contains invalid characters"),
  includePlatforms: z.array(z.string()).default(['reddit']),
  recaptchaToken: z.string().optional(),
});

// Contact form validation
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().min(1, "Company is required").max(100),
  brandName: z.string().min(1, "Brand name is required").max(100),
  message: z.string().max(1000, "Message too long").optional(),
});

// Ticket creation validation
export const ticketSchema = z.object({
  type: z.enum(['removal', 'monitoring', 'consultation']),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  urls: z.array(z.string().url()).optional(),
});

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new Error(firstError.message);
    }
    throw new Error("Invalid input data");
  }
}