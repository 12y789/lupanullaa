const DEFAULT_ALLOWED_ORIGIN = 'https://lupanullaa.netlify.app';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2000;
const MAX_SYSTEM_CHARS = 500;
const MAX_TOTAL_CHARS = 8000;
const MAX_BODY_CHARS = 12000;

function jsonResponse(statusCode, payload, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders
    },
    body: JSON.stringify(payload)
  };
}

function getCorsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (origin && origin === ALLOWED_ORIGIN) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }

  return headers;
}

exports.handler = async function(event) {
  const origin = event.headers?.origin || '';
  const corsHeaders = getCorsHeaders(origin);

  if (event.httpMethod === 'OPTIONS') {
    if (!origin || origin !== ALLOWED_ORIGIN) {
      return jsonResponse(403, { error: 'Origin haijaruhusiwa' }, corsHeaders);
    }
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' }, corsHeaders);
  }

  if (origin !== ALLOWED_ORIGIN) {
    return jsonResponse(403, { error: 'Origin haijaruhusiwa' }, corsHeaders);
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return jsonResponse(400, { error: 'JSON si sahihi' }, corsHeaders);
  }

  const { system, messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonResponse(400, { error: 'Messages inahitajika' }, corsHeaders);
  }

  if (messages.length > MAX_MESSAGES) {
    return jsonResponse(400, { error: `Messages zinaweza kuwa max ${MAX_MESSAGES}` }, corsHeaders);
  }

  if (typeof system !== 'undefined' && typeof system !== 'string') {
    return jsonResponse(400, { error: 'System lazima iwe string' }, corsHeaders);
  }

  const systemText = typeof system === 'string' ? system.trim() : '';
  if (systemText.length > MAX_SYSTEM_CHARS) {
    return jsonResponse(400, { error: `System inaweza kuwa max ${MAX_SYSTEM_CHARS} herufi` }, corsHeaders);
  }

  const totalChars = systemText.length + messages.reduce((sum, message) => {
    if (message && typeof message === 'object' && typeof message.content === 'string') {
      return sum + message.content.trim().length;
    }
    return sum;
  }, 0);

  if (totalChars > MAX_TOTAL_CHARS) {
    return jsonResponse(400, { error: `Payload inaweza kuwa max ${MAX_TOTAL_CHARS} herufi` }, corsHeaders);
  }

  const sanitizedMessages = [];
  for (const message of messages) {
    if (!message || typeof message !== 'object') {
      return jsonResponse(400, { error: 'Message lazima iwe object' }, corsHeaders);
    }

    const role = String(message.role || '').toLowerCase();
    const content = message.content;

    if (!['user', 'assistant'].includes(role)) {
      return jsonResponse(400, { error: 'Role isiyo sahihi' }, corsHeaders);
    }

    if (typeof content !== 'string') {
      return jsonResponse(400, { error: 'Content lazima iwe string' }, corsHeaders);
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return jsonResponse(400, { error: 'Content haiwezi kuwa tupu' }, corsHeaders);
    }

    if (trimmedContent.length > MAX_MESSAGE_CHARS) {
      return jsonResponse(400, { error: `Content inaweza kuwa max ${MAX_MESSAGE_CHARS} herufi` }, corsHeaders);
    }

    sanitizedMessages.push({
      role: role === 'assistant' ? 'model' : 'user',
      parts: [{ text: trimmedContent }]
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, { error: 'Hitilafu ya seva' }, corsHeaders);
  }

  const safeSystem = typeof system === 'string' ? system.trim().slice(0, MAX_SYSTEM_CHARS) : 'Wewe ni msaidizi wa elimu wa Lupanulla Tanzania.';

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: safeSystem }]
        },
        contents: sanitizedMessages,
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7
        }
      }),
      signal: controller.signal
    });

    const data = await response.json();

    if (!response.ok) {
      const geminiError = data?.error?.message || 'Samahani, huduma ina tatizo. Jaribu tena.';
      return jsonResponse(502, { error: geminiError }, corsHeaders);
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const replyText = typeof reply === 'string' ? reply.trim() : 'Samahani, sijapata jibu.';

    return jsonResponse(200, { content: [{ type: 'text', text: replyText }] }, corsHeaders);
  } catch (err) {
    if (err.name === 'AbortError') {
      return jsonResponse(504, { error: 'Muda wa ombi umeisha' }, corsHeaders);
    }

    return jsonResponse(500, { error: 'Hitilafu ya mtandao. Jaribu tena.' }, corsHeaders);
  } finally {
    clearTimeout(timeout);
  }
};
