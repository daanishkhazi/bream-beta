import { NextApiRequest, NextApiResponse } from 'next';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import { Configuration, OpenAIApi } from "openai";

export const config = {
  runtime: "edge",
};


const handler = async (req: NextApiRequest, res: NextApiResponse) => {

    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY
    });
    const openai = new OpenAIApi(configuration);

    if (req.method !== 'POST') {
      return res.status(405).end();
    }

    const session = await getSession(req, res);
    if (!session) {
      return res.status(401).end();
    }

    let { messages, machine, job } = req.body;

    const chatCompletion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages, 
    });

    if (!chatCompletion.data.choices[0].message?.content) {
        return res.status(404).json({ message: "No response from AI" });
    }
    console.log(chatCompletion.data.choices[0].message)
    return res.status(200).json({ role: chatCompletion.data.choices[0].message?.role, content: chatCompletion.data.choices[0].message?.content });
}

export default withApiAuthRequired(handler);