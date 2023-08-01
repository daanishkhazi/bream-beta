import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { Role } from "@/types/dbTypes";
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

// Define your request body type
interface RequestBody {
  userId: string;
  machines: string[];
  role: Role;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  // Ensure you're handling a PUT request
  if (req.method !== "PUT") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const { userId, machines, role }: RequestBody = req.body;

  // Only proceed if the ids match
  if (id !== userId) {
    res.status(400).json({ message: "Bad request" });
    return;
  }

  // Wrap in try/catch for error handling
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        // Set the machines to connect
        machines: {
          set: machines.map((machineId) => ({ id: machineId })),
        },
        // Update the role
        role,
      },
      include: {
        machines: true, // Include the updated machines in the response
      },
    });

    // Return the updated user
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export default withApiAuthRequired(handler);