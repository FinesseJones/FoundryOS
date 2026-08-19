import { z } from 'zod';

export interface Timestamps {
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export const TimestampsSchema = z.object({
  createdAt: z.string().datetime({ message: 'createdAt must be an ISO 8601 string' }),
  updatedAt: z.string().datetime({ message: 'updatedAt must be an ISO 8601 string' }),
});

export function nowISO(): string {
  return new Date().toISOString();
}

export function createTimestamps(): Timestamps {
  const now = nowISO();
  return {
    createdAt: now,
    updatedAt: now,
  };
}

export function touchTimestamps(timestamps: Timestamps): Timestamps {
  return {
    createdAt: timestamps.createdAt,
    updatedAt: nowISO(),
  };
}
