import { z } from 'zod';

export const UserV1Schema = z.object({
  firstname: z.string(),
  lastname: z.string(),
});

export type UserV1 = z.infer<typeof UserV1Schema>;

export const UserV2Schema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  fullname: z.string(),
});

export type UserV2 = z.infer<typeof UserV2Schema>;

export const UserV3Schema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  fullname: z.string(),
  shortname: z.string(),
});

export type UserV3 = z.infer<typeof UserV3Schema>;
