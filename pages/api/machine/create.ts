// /pages/api/machine.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  // Get the user session
  const session = await getSession(req, res);
  if (!session) {
    // If no session exists, respond with a 401
    return res.status(401).end();
  }
  
  // Fetch user from database based on auth0Id from the session
  const user = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub },
  });

  if (!user) {
    // If no user is found, respond with an error
    return res.status(404).json({ message: "User not found" });
  }

  // Assuming 'machine' is the data sent in the request
  const machine = req.body;

  // Create machine using the tenantId associated with the user
  const newMachine = await prisma.machine.create({
    data: {
      ...machine,  // assuming machine object includes name, description, generalNotes, maintenanceNotes, isActive
      tenantId: user.tenantId,
    },
  });

  res.json(newMachine);
};

export default withApiAuthRequired(handler);
