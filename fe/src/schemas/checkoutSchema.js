import { z } from 'zod';

export const checkoutSchema = z.object({
  email: z.string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  newsletter: z.boolean().optional(),
  
  firstName: z.string()
    .min(1, "First name is required"),
  lastName: z.string()
    .min(1, "Last name is required"),
  
  address: z.string()
    .min(1, "Shipping address is required"),
  apartment: z.string().optional(),
  
  city: z.string()
    .min(1, "City is required"),
  country: z.string()
    .min(1, "Please select a country"),
  
  postalCode: z.string()
    .min(3, "Please enter a valid postal code"),
  phone: z.string()
    .min(5, "Please enter a valid phone number"),
  
  shippingMethod: z.enum(["Standard", "Express"]).default("Standard"),
});
