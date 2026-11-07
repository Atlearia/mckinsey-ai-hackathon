import { handleAlly } from '../server/ally.mjs';

export default async function handler(req,res) {
  if (req.headers.origin !== 'https://' + req.headers.host) {
    res.writeHead(403);
    return res.end();
  }
  await handleAlly(req,res,process.env.OPENAI_API_KEY);
}
