import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "GET") {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: req.query.id as string },
      select: { role: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" }); // User Not Found
    }

    return res.status(200).json({ role: user.role }); // Return user role
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" }); // Internal Server Error
  }
}

export default withApiAuthRequired(handler);