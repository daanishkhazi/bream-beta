import prisma from '../../../lib/prisma';
import { handleAuth, handleCallback } from "@auth0/nextjs-auth0";

export default handleAuth({
    async callback(req, res) {
        try {
            await handleCallback(req, res, {
                afterCallback: async (req, res, session) => {
                    const { user } = session
                    console.log(user);
                    const existinguser = await prisma.user.findUnique({
                        where : { 
                            auth0Id: user.sub
                        },
                    });
                    if(!existinguser){
                        await prisma.user.create({
                            data: {
                                auth0Id: user.sub,
                                tenant: { connect: { id: 1 } },
                                name: user.nickname,
                            }
                        });
                    }
                    return session;
                },
            });
        } catch (error) {
            console.error(error);
            res.status(error.status || 500).end(error.message);
        }
    }
});