import { Configuration, OpenAIApi } from 'openai-edge'
import { OpenAIStream, StreamingTextResponse } from 'ai'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'

export default async function handler(req: Request, res: Response) {
    const incoming = await req.json()
    const { messages } = incoming
    console.log(incoming)
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages
    })
    const stream = OpenAIStream(response)
    return new StreamingTextResponse(stream)
  }