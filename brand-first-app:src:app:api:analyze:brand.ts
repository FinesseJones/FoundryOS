import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { analyzeBrand } from '../../../lib/brandAnalysis';

interface AnalysisRequest {
 brandName: string;
 url?: string;
 content?: string;
}

const ANALYSIS_SCHEMA = z.object({
 brandName: z.string().min(2).max(100),
 url: z.string().url().optional(),
 content: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 if (req.method !== 'POST') {
   return res.status(405).json({ success: false, error: 'Method not allowed' });
 }

 try {
   const body = JSON.parse(req.body || '{}');
   const validated = ANALYSIS_SCHEMA.parse(body);

   const analysis = await analyzeBrand(validated);

   return res.status(200).json({
     success: true,
     analysis,
   });
 } catch (error) {
   console.error('Analysis failed:', error);
   return res.status(400).json({
     success: false,
     error: 'Analysis failed',
   });
 }
}