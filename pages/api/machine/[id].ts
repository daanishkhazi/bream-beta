import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { Machine } from '@/types/dbTypes';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).end();
  }

  const machine = req.body;
  const updatedMachine = await prisma.machine.update({
    where: { id: req.query.id as string },
    data: {
      name: machine.name,
      description: machine.description,
      generalNotes: machine.generalNotes,
      maintenanceNotes: machine.maintenanceNotes,
      isActive: machine.isActive
    },
  });

  res.json(updatedMachine);
}

export default withApiAuthRequired(handler);