const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async function(event) {

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch(e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'JSON si sahihi' }) };
  }

  const { system, messages } = body;

  if (!messages || messages.length === 0) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Messages inahitajika' }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ content: [{ type: 'text', text: 'Hitilafu ya seva.' }] }) };
  }

  const geminiContents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || '').trim() }]
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: system || 'Wewe ni msaidizi wa elimu wa Lupanulla Tanzania.' }]
        },
        contents: geminiContents,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ content: [{ type: 'text', text: 'Samahani, huduma ina tatizo. Jaribu tena.' }] }) };
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Samahani, sijapata jibu.';

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ content: [{ type: 'text', text: reply }] })
    };

  } catch(err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ content: [{ type: 'text', text: 'Hitilafu ya mtandao. Jaribu tena.' }] }) };
  }

};
