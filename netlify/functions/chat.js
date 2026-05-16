
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive'
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers: { ...CORS, 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { 
      statusCode: 400, 
      headers: { ...CORS, 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ error: 'JSON si sahihi' }) 
    };
  }

  const { system, messages } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { 
      statusCode: 400, 
      headers: { ...CORS, 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ error: 'Messages inahitajika' }) 
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY haipo");
    return { 
      statusCode: 500, 
      headers: { ...CORS, 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ error: 'Hitilafu ya seva' }) 
    };
  }

  // Convert to Gemini format
  const geminiContents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || '').trim() }]
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContentStream?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { 
          parts: [{ 
            text: system || 'Wewe ni msaidizi wa elimu wa Lupanulla Tanzania. Jibu kwa Kiswahili safi, rahisi na cha kuelimisha.' 
          }] 
        },
        contents: geminiContents,
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
          topP: 0.95,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini Streaming Error:", errorData);
      return { 
        statusCode: 502, 
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Samahani, huduma ina tatizo. Jaribu tena.' }) 
      };
    }

    // **Streaming Response**
    return {
      statusCode: 200,
      headers: CORS,
      body: response.body
    };

  } catch (err) {
    console.error("Streaming Error:", err);
    return { 
      statusCode: 500, 
      headers: { ...CORS, 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        error: 'Hitilafu ya mtandao. Tafadhali jaribu tena.' 
      }) 
    };
  }
};
