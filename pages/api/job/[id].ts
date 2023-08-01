import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { Job } from '@/types/dbTypes';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).end();
  }
  const job = req.body;
  const updatedJob = await prisma.job.update({
    where: { id: req.query.id as string },
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

export default withApiAuthRequired(handler);