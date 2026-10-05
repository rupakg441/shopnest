import { z } from 'zod';

export const updateStoreSettingsValidator = z.object({
  storeName: z.string().trim().min(2).max(80),
  supportEmail: z.union([z.string().trim().email().max(254), z.literal('')]),
  supportPhone: z.string().trim().max(40),
  announcement: z.string().trim().max(240),
  announcementEnabled: z.boolean(),
}).strict();
