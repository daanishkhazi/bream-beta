import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

function generateUniqueCode() {
  return crypto.randomBytes(8).toString('hex');
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  const postmark = await import('postmark');
  const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY!);

  // Extract tenant details from the request body
  const { tenantName, email, name } = req.body;

  // Create new Tenant
  let tenant;
  try {
    tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: 'Error creating tenant' });
  }

  // Generate a unique code
  const uniqueCode = generateUniqueCode();

  // Create new Code
  let newCode;
  try {
    newCode = await prisma.code.create({
      data: {
        email,
        code: uniqueCode,
        name,
        tenantId: tenant.id,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: 'Error creating code' });
  }

  
  
  try {
    await client.sendEmailWithTemplate({
      From: 'daanish@trybream.com',
      To: email,
      TemplateAlias: "user-invitation",
      TemplateModel: {
        code: uniqueCode,
        name,
        tenant_name: tenant.name,
        product_name: 'Bream',
        product_url: 'https://trybream.com',
        company_name: 'Bream Labs, Inc.',
        company_address: 'Sammamish, WA 98075',
        support_email: 'support@trybream.com',
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: 'Error sending email' });
  }

  return res.status(200).json({ tenant, newCode });
}

export default withApiAuthRequired(handler);