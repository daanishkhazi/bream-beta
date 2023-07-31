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

  // Assuming 'job' is the data sent in the request
  const job = req.body;
  console.log(job)
  const {
    name,
    description,
    setupNotes,
    operationNotes,
    qualityNotes,
    isActive,
    part,
    machineId
  } = job;


  // Create job using the machineId associated with the user
  // It's unclear from your schema where machineId comes from, so for this example I'm assuming it's part of the job object sent in the request.
  // If that's not the case, you'll need to modify this to retrieve the correct machineId.
  const newJob = await prisma.job.create({
    data: {
      ...job,  // assuming job object includes name, description, setupNotes, operationNotes, qualityNotes, isActive, part, and machineId
    },
  });

  res.json(newJob);
};

export default withApiAuthRequired(handler);