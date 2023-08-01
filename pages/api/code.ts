// /api/code.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

function generateUniqueCode() {
  return crypto.randomBytes(8).toString('hex');
}

const handler = async(req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  const postmark = await import('postmark');
  const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY!);

  // Get the user session
  const session = await getSession(req, res);
  if (!session) {
    // If no session exists, respond with a 401
    return res.status(401).end();
  }
  
  // Get user info
  const user = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub },
  });

  if (!user) {
    res.status(400).json({ error: 'User not found' });
    return;
  }

  // Generate a unique code
  const uniqueCode = generateUniqueCode();

  // Create new Code
  const newCode = await prisma.code.create({
    data: {
      email: req.body.email,
      code: uniqueCode,
      name: req.body.name,
      tenantId: user.tenantId,
    },
  });

  // Send email
  try {
    await client.sendEmailWithTemplate({
      From: 'daanish@trybream.com',
      To: req.body.email,
      TemplateAlias: "user-invitation",
      TemplateModel: {
        code: uniqueCode,
        name: req.body.name,
        product_name: 'Bream',
        product_url: 'https://trybream.com',
        company_name: 'Bream Labs, Inc.',
        company_address: 'Sammamish, WA 98075',
        support_email: 'daanish@trybream.com',
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: 'Error sending email' });
  }

  return res.status(200).json(newCode);
}

export default withApiAuthRequired(handler);