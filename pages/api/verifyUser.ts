import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const { code } = req.body;

    if (req.method !== 'POST') {
      return res.status(405).end();
    }

    const session = await getSession(req, res);
    if (!session) {
      return res.status(401).end();
    }

    const dBuser = await prisma.user.findUnique({
        where: { auth0Id: session.user.sub },
    });

    if (!dBuser) {
        return res.status(404).json({ message: "User not found" });
    }

    const verificationCode = await prisma.code.findUnique({
        where: { code: code },
        include: { tenant: true }
    });

    if (!verificationCode) {
        return res.status(404).json({ message: "Code not found" });
    }

    if (verificationCode.email !== session.user.email) {
        return res.status(404).json({ message: "Code not found" });
    }

    const existingAdmins = await prisma.user.count({
        where: {
            tenantId: verificationCode.tenantId,
            role: 'ADMIN',
        }
    });
    const role = existingAdmins === 0 ? 'ADMIN' : 'USER';

    const updatedUser = await prisma.user.update({
        where: { id: dBuser.id },
        data: {
            verified: true,
            name: verificationCode.name,
            tenantId: verificationCode.tenantId,
            role: role,
        }
    });

    return res.status(200).json({ message: "User verified" , role: role});
}

export default withApiAuthRequired(handler);