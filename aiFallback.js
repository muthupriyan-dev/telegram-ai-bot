// aiFallback.js
// Multi-provider AI fallback chain.
// Takes (systemPrompt, contents) where contents is Gemini-style:
//   [{ role: 'user' | 'model', parts: [{ text: '...' }] }, ...]
// Tries each provider/model in MODEL_CHAIN order until one succeeds.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const COHERE_API_KEY = process.env.COHERE_API_KEY;
const HF_API_KEY = process.env.HF_API_KEY;

// Edit order / add-remove entries here.
const MODEL_CHAIN = [
  { provider: 'gemini', model: 'gemini-2.5-flash' },
  { provider: 'gemini', model: 'gemini-2.5-flash-lite' },
  { provider: 'gemini', model: 'gemini-2.0-flash' },
  { provider: 'groq', model: 'llama-3.3-70b-versatile' },
  { provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct:free' },
  { provider: 'cohere', model: 'command-r-plus' },
  { provider: 'huggingface', model: 'meta-llama/Llama-3.1-8B-Instruct' },
];

// ---- Convert Gemini-style contents -> plain {role, content} messages ----
// role 'model' -> 'assistant' for OpenAI-style providers
function toPlainMessages(systemPrompt, contents) {
  const messages = [{ role: 'system', content: systemPrompt }];
  for (const c of contents) {
    messages.push({
      role: c.role === 'model' ? 'assistant' : 'user',
      content: c.parts.map((p) => p.text).join('\n'),
    });
  }
  return messages;
}

// Flatten to a single prompt string (for providers without chat-message support)
function toSinglePrompt(systemPrompt, contents) {
  const convo = contents
    .map((c) => `${c.role === 'model' ? 'Me' : 'Them'}: ${c.parts.map((p) => p.text).join(' ')}`)
    .join('\n');
  return `${systemPrompt}\n\n${convo}\nMe:`;
}

// ---- Provider callers ----

async function callGemini(model, systemPrompt, contents) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 500,
        },
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const err = new Error(result?.error?.message || 'Gemini error');
    err.status = response.status;
    throw err;
  }

  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty response');
  return text.trim();
}

async function callGroq(model, systemPrompt, contents) {
  const messages = toPlainMessages(systemPrompt, contents);

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature: 0.9, max_tokens: 500 }),
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error?.message || 'Groq error');
    err.status = res.status;
    throw err;
  }
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq returned empty response');
  return text.trim();
}

async function callOpenRouter(model, systemPrompt, contents) {
  const messages = toPlainMessages(systemPrompt, contents);

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature: 0.9, max_tokens: 500 }),
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error?.message || 'OpenRouter error');
    err.status = res.status;
    throw err;
  }
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenRouter returned empty response');
  return text.trim();
}

async function callCohere(model, systemPrompt, contents) {
  const history = contents.slice(0, -1).map((c) => ({
    role: c.role === 'model' ? 'CHATBOT' : 'USER',
    message: c.parts.map((p) => p.text).join(' '),
  }));
  const lastMessage = contents[contents.length - 1]?.parts?.map((p) => p.text).join(' ') || '';

  const res = await fetch('https://api.cohere.com/v1/chat', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${COHERE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      preamble: systemPrompt,
      chat_history: history,
      message: lastMessage,
      temperature: 0.9,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.message || 'Cohere error');
    err.status = res.status;
    throw err;
  }
  const text = data?.text;
  if (!text) throw new Error('Cohere returned empty response');
  return text.trim();
}

async function callHuggingFace(model, systemPrompt, contents) {
  const prompt = toSinglePrompt(systemPrompt, contents);

  const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 300, temperature: 0.9, return_full_text: false },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error || 'HuggingFace error');
    err.status = res.status;
    throw err;
  }
  const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
  if (!text) throw new Error('HuggingFace returned empty response');
  return text.trim();
}

// ---- Main entry point ----
// systemPrompt: string
// contents: Gemini-style array (same shape your bot.js already builds)
async function generateWithFallback(systemPrompt, contents, index = 0) {
  if (index >= MODEL_CHAIN.length) {
    console.error('🚫 All AI providers exhausted.');
    return null;
  }

  const { provider, model } = MODEL_CHAIN[index];

  try {
    let text;
    switch (provider) {
      case 'gemini':
        text = await callGemini(model, systemPrompt, contents);
        break;
      case 'groq':
        text = await callGroq(model, systemPrompt, contents);
        break;
      case 'openrouter':
        text = await callOpenRouter(model, systemPrompt, contents);
        break;
      case 'cohere':
        text = await callCohere(model, systemPrompt, contents);
        break;
      case 'huggingface':
        text = await callHuggingFace(model, systemPrompt, contents);
        break;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }

    console.log(`✅ Reply generated using: ${provider}/${model}`);
    return text;
  } catch (error) {
    console.log(`⚠️  Failed: ${provider}/${model} — ${error.message}`);
    return generateWithFallback(systemPrompt, contents, index + 1);
  }
}

module.exports = { generateWithFallback, MODEL_CHAIN };
