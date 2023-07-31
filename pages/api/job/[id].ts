import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { Job } from '@/types/dbTypes';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).end();
  }
  console.log(req.query)
  const job = req.body;
  const updatedJob = await prisma.job.update({
    where: { id: Number(req.query.id) },
    data: {
      name: job.name,
      description: job.description,
      isActive: job.isActive,
      operationNotes: job.operationNotes,
      part: job.part,
      qualityNotes: job.qualityNotes,
      setupNotes: job.setupNotes
    },
  });

  res.json(updatedJob);
}
