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

// Password reset validation
export const passwordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// Chatbot validation
export const chatbotSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000, "Message too long"),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).optional().default([]),
});

// Emergency ticket validation
export const emergencyTicketSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().max(20).optional(),
  description: z.string().min(1, "Description is required").max(2000),
  errorDetails: z.record(z.unknown()).optional(),
});

// Data admin user creation
export const dataAdminUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  role: z.enum(["user", "admin"]).default("user"),
  accountBalance: z.string().optional(),
  creditsRemaining: z.number().optional(),
});

// Data admin order creation
export const dataAdminOrderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: z.string().min(1, "Type is required"),
  status: z.string().min(1, "Status is required"),
  title: z.string().min(1, "Title is required").max(200),
  redditUrl: z.string().url().optional().nullable(),
  amount: z.string().optional().nullable(),
  progress: z.number().min(0).max(100).optional(),
});

// Scan brand validation
export const scanBrandRequestSchema = z.object({
  brandName: z.string().min(1, "Brand name is required").max(100),
  includePlatforms: z.array(z.string()).optional().default(["reddit", "reviews", "social", "news"]),
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