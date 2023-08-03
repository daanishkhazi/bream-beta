import prisma from '../../../lib/prisma';
import { handleAuth, handleCallback } from "@auth0/nextjs-auth0";

export default handleAuth({
    async callback(req, res) {
        try {
            await handleCallback(req, res, {
                afterCallback: async (req, res, session) => {
                    const { user } = session
                    
                    const existinguser = await prisma.user.findUnique({
                        where : { 
                            auth0Id: user.sub
                        },
                    });
                    if(!existinguser){
                        await prisma.user.create({
                            data: {
                                auth0Id: user.sub,
                                tenant: { connect: { id: 'clkvm4kiz0000x0w57b8wl5ox' } },
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