// /api/code.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@auth0/nextjs-auth0'
import prisma from '@/lib/prisma';
import crypto from 'crypto';

function generateUniqueCode() {
    return crypto.randomBytes(8).toString('hex');
}


export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    // Get the user session
    const session = await getSession(req, res);
    if (!session) {
        // If no session exists, respond with a 401
        return res.status(401).end();
    }
    // Get user info
    const user = await prisma.user.findUnique({
      where: { auth0Id: session.user.sub },
    })

    if (!user) {
      res.status(400).json({ error: 'User not found' })
      return
    }

    // Generate a unique code
    const uniqueCode = generateUniqueCode();

    // Create new Code
    const newCode = await prisma.code.create({
      data: {
        email: req.body.email,
        code: uniqueCode,
        tenantId: user.tenantId,
      },
    })

    res.status(200).json(newCode)
}
