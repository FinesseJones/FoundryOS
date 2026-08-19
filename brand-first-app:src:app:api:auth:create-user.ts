import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

interface CreateUser {
 name?: string;
 email: string;
 password: string;
}

const USER_SCHEMA = z.object({
 name: z.string().min(2).max(100).optional(),
 email: z.string().email().min(3).max(255),
 password: z.string().min(8).max(128),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 if (req.method !== 'POST') {
   return res.status(405).json({ success: false, error: 'Method not allowed' });
 }

 try {
   const input = JSON.parse(req.body || '{}');
   const validated = USER_SCHEMA.parse(input);

   // Simplified: in production, use a real auth (NextAuth, Auth.js, etc.)
   // For this MVP, we just create a basic session
   const session = {
     id: generateId(),
     userId: generateId(),
     email: validated.email,
     name: validated.name,
     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
   };

   return res.status(201).json({
     success: true,
     session,
   });
 } catch (error) {
   console.error('User creation failed:', error);
   return res.status(400).json({
     success: false,
     error: 'Validation failed',
   });
 }
}

function generateId(): string {
 return Math.random().toString(36).substring(2, 12);
}