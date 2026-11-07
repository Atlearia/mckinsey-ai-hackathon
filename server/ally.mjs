import { readFile } from 'node:fs/promises';

const instructions = await readFile(new URL('../ally-system-prompt.txt', import.meta.url), 'utf8');
const sentences = new Intl.Segmenter(undefined, {granularity:'sentence'});

function confusesTargets(reply, rules) {
  if(!Number.isInteger(rules?.requiredSlices)||rules.requiredSlices===rules.minimumCheeseSlices)return false;
  const phrases=[
    'need(?:s)? '+rules.requiredSlices+' cheese slices',
    'require(?:s)? '+rules.requiredSlices+' cheese slices',
    rules.requiredSlices+' cheese slices (?:are )?(?:needed|required)',
    '(?:faut|besoin de) '+rules.requiredSlices+' pointes (?:au|de) fromage'
  ];
  return phrases.some(phrase=>new RegExp(phrase,'i').test(reply));
}

function fitsChat(reply) {
  return reply.length > 0 && reply.split(/\s+/).length <= 40 &&
    [...sentences.segment(reply)].length <= 3;
}

export async function handleAlly(req,res,apiKey){
  function finish(status, body = {}) {
    res.writeHead(status, {'Content-Type':'application/json', 'Cache-Control':'no-store'});
    res.end(JSON.stringify(body));
  }
  if (req.method !== 'POST') return finish(405);
  if (req.headers['content-type'] !== 'application/json') return finish(415);
  if (!apiKey) return finish(503);
  let payload;
  try {
    if (req.body !== undefined) {
      const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (Buffer.byteLength(raw) > 96000) return finish(413);
      payload = JSON.parse(raw);
    } else {
      const chunks = [];
      let bytes = 0;
      for await (const chunk of req) {
        bytes += chunk.length;
        if (bytes > 96000) return finish(413);
        chunks.push(chunk);
      }
      payload = JSON.parse(Buffer.concat(chunks).toString());
    }
  } catch { return finish(400); }
  if (!payload || typeof payload.context !== 'string' || typeof payload.question !== 'string' ||
      !payload.question.trim() || payload.question.length > 300 || payload.context.length > 18000) return finish(400);
  let rules;
  try { rules=JSON.parse(payload.context)?.rules; } catch {}
  const content = [{type:'input_text', text:payload.context}];
  if (payload.image) {
    if (typeof payload.image !== 'string' || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(payload.image)) return finish(400);
    content.push({type:'input_image', image_url:payload.image, detail:'auto'});
  }
  content.push({type:'input_text', text:payload.question});
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const style = attempt ? '\nSimplify further. Use up to two short sentences. Only the cheese-only guests require cheese slices; check the two separate targets.' : '';
      const upstream = await fetch('https://api.openai.com/v1/responses', {
        method:'POST', signal:AbortSignal.timeout(15000),
        headers:{Authorization:'Bearer '+apiKey, 'Content-Type':'application/json'},
        body:JSON.stringify({model:process.env.OPENAI_MODEL || 'gpt-4.1-mini',
          instructions:instructions+style, input:[{role:'user', content}], store:false, max_output_tokens:150})
      });
      if (!upstream.ok) return finish(upstream.status === 429 ? 429 : 502);
      const answer = await upstream.json();
      const reply = answer.output.filter(item => item.type === 'message')
        .flatMap(item => item.content).filter(part => part.type === 'output_text').map(part => part.text).join('\n').trim();
      if (answer.status === 'completed' && fitsChat(reply) && !confusesTargets(reply,rules)) return finish(200, {reply});
    }
    finish(502);
  } catch { finish(502); }
}
