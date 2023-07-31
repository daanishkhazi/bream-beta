import prisma from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { id } = req.query;
  if (Array.isArray(id)) {
    id = id[0];
  }
  if (req.method !== "GET") {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: id },
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
