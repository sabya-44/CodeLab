import type { AiLesson } from '../types/aiTutorial';

const AI_CSS = `body { font-family: system-ui, sans-serif; background: #f8fafc; padding: 18px; color: #0f172a; }
.box { max-width: 460px; margin: 0 auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; }
h1 { font-size: 16px; margin: 0 0 10px; }
p, li { font-size: 13px; line-height: 1.5; }
input, textarea, select { width: 100%; padding: 7px 9px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; margin-bottom: 8px; font-family: inherit; }
button { padding: 7px 12px; background: #0284c7; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; margin-right: 6px; margin-bottom: 6px; }
button.secondary { background: #475569; }
button.danger { background: #be123c; }
.out { background: #f1f5f9; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 12px; margin-top: 10px; white-space: pre-wrap; }
.card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-top: 8px; background: #f8fafc; }`;

export const AI_LESSONS_PART_1: AiLesson[] = [
  {
    id: 'ai01-what-is-ai-llm',
    number: 1,
    stageId: 'stage-1-foundations',
    stageTitle: 'Stage 1: AI Basics for Web Developers',
    levelLabel: 'Beginner Friendly',
    title: 'How AI & LLMs Actually Work (For Complete Beginners)',
    jobRoleFocus: 'Understanding What AI Models Can & Cannot Do in Web Apps',
    summary:
      'Demystify Large Language Models (LLMs): learn what tokens, context windows, and stateless API calls really are—and why Full-Stack Developers build with AI APIs rather than training neural networks from scratch.',
    keyTakeaway:
      'Think of an LLM as a super-smart stateless text/JSON prediction API (`input tokens -> output tokens`). It does NOT remember previous HTTP requests unless your backend sends the history, and it does NOT know your private database unless you supply it.',
    architectureSteps: [
      { actor: '1. User Input', action: 'User types a prompt or clicks "Summarize" in your React UI' },
      { actor: '2. Tokenizer', action: 'Text is split into small chunks called tokens (~4 chars each)' },
      { actor: '3. LLM Engine', action: 'Model reads input + instructions inside its Context Window' },
      { actor: '4. Prediction Output', action: 'Model streams back generated text or structured JSON' },
    ],
    explanation: [
      'If you are completely new to AI, remove the mystery first: as a Full-Stack Web Developer, your job is NOT to invent math formulas or train neural networks on massive GPU clusters. Tech labs like Google train foundation models (such as Gemini) for you and expose them over standard HTTPS APIs—just like Stripe handles payments or Twilio handles SMS.',
      'An LLM (Large Language Model) does not read whole words the way humans do; it converts text into small pieces called **tokens** (roughly 3–4 English characters per token, so 100 words is ~130 tokens). Cloud AI providers charge per input token + output token, and every model has a **Context Window**—the maximum number of tokens it can read and write in a single request.',
      'Two critical rules every beginner must learn early: First, an LLM API call is **stateless** (it forgets everything the moment the response finishes unless your backend re-sends conversation history). Second, it is **probabilistic** (asking the exact same question twice can yield slightly differently worded answers), so production web apps validate AI outputs carefully.',
    ],
    codeBlueprint: {
      backendLabel: 'server/aiBasics.ts (Node.js + @google/genai)',
      backendCode: `import { GoogleGenAI } from '@google/genai';

// Initialized ONCE on the server using your secret environment key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
});

export async function explainConcept(question: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: question,
  });

  // Always read .text as a property (never response.text())
  return response.text ?? '';
}`,
      frontendLabel: 'client/App.tsx (Standard Browser Fetch)',
      frontendCode: `async function askTeacher(question: string) {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error('Request failed: ' + res.status);
  const data = await res.json();
  return data.answer;
}`,
    },
    commonMistake: {
      label: 'Treating an AI model like a deterministic SQL database with permanent memory',
      avoid: `// Request 1: "My name is Sabyasanket"
// Request 2 (new HTTP call without history): "What is my name?"
// -> Model has NO idea! Each API call starts fresh.`,
      prefer: `// Always store chat messages in your database or state
// and send the relevant conversation context in every request.`,
    },
    practice: {
      taskPrompt:
        'Experiment with this interactive Token & Cost Estimator in JavaScript: type any prompt below to see how character length maps to approximate tokens and how much of a Context Window remains.',
      starterHtml: `<div class="box">
  <h1>Token & Context Window Simulator</h1>
  <textarea id="prompt-in" rows="3">Explain JavaScript closures to a BCA student with one real shopping cart example.</textarea>
  <button id="btn-calc" type="button">Estimate Tokens & Budget</button>
  <div id="out" class="out">Click to calculate tokens</div>
</div>`,
      starterCss: AI_CSS,
      starterJs: `const CONTEXT_LIMIT = 8192; // Example budget in tokens

function estimateTokens(text) {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  // Rule of thumb: ~4 characters per token in English
  return Math.ceil(cleaned.length / 4);
}

document.getElementById('btn-calc').addEventListener('click', () => {
  const text = document.getElementById('prompt-in').value;
  const inputTokens = estimateTokens(text);
  const reservedOutput = 500;
  const remaining = CONTEXT_LIMIT - inputTokens - reservedOutput;

  const report = [
    'Characters: ' + text.length,
    'Approx Input Tokens: ~' + inputTokens,
    'Reserved Reply Budget: ' + reservedOutput + ' tokens',
    'Remaining Window: ' + remaining + ' tokens',
  ].join('\\n');

  document.getElementById('out').textContent = report;
  console.log('Token estimate:', inputTokens);
});`,
      solutionJs: `const CONTEXT_LIMIT = 8192;
function estimateTokens(text) {
  const cleaned = text.trim();
  return cleaned ? Math.ceil(cleaned.length / 4) : 0;
}
document.getElementById('btn-calc').addEventListener('click', () => {
  const text = document.getElementById('prompt-in').value;
  const tokens = estimateTokens(text);
  document.getElementById('out').textContent =
    'Words: ' + text.trim().split(/\\s+/).length +
    '\\nApprox Tokens: ' + tokens +
    '\\nUsage: ' + ((tokens / CONTEXT_LIMIT) * 100).toFixed(2) + '% of 8k window';
});`,
    },
    quiz: [
      {
        question: 'If you send two separate HTTP requests to an LLM API without including the first message, does it remember the first request?',
        options: [
          'Yes, the AI model stores your session in its neural weights',
          'No—each API request is stateless unless your app sends conversation history',
          'Yes, as long as you use `const` on the frontend',
        ],
        correctIndex: 1,
        explanation:
          'LLM APIs are stateless. Your full-stack app must store prior messages (e.g., in Firestore or React state) and re-send context on follow-up turns.',
      },
      {
        question: 'Roughly how many English characters make up 1 token in an LLM?',
        options: ['About 4 characters', 'About 100 characters', 'Exactly 1 paragraph'],
        correctIndex: 0,
        explanation:
          'Tokens are sub-word fragments—typically around 4 characters (or ~0.75 words) in English.',
      },
    ],
  },
  {
    id: 'ai02-fullstack-architecture',
    number: 2,
    stageId: 'stage-1-foundations',
    stageTitle: 'Stage 1: AI Basics for Web Developers',
    levelLabel: 'Beginner Friendly',
    title: 'Full-Stack AI Architecture: Frontend -> Backend Proxy -> AI',
    jobRoleFocus: 'Connecting React/HTML Frontends Safely to Express/Node AI Routes',
    summary:
      'Learn the #1 architectural rule in AI Web Development: why browser code talks to YOUR `/api/*` backend endpoint, and how your server calls `@google/genai` using `process.env.GEMINI_API_KEY`.',
    keyTakeaway:
      'Never import `@google/genai` or place API keys inside frontend React/Vite code! Always build a server-side route (`POST /api/ai/...`) that validates the user, calls the AI SDK using `process.env.GEMINI_API_KEY`, and returns clean data to the browser.',
    architectureSteps: [
      { actor: '1. React / Browser', action: 'Calls fetch("/api/ai/explain", { method: "POST", body })' },
      { actor: '2. Backend Express API', action: 'Checks auth, rate limits, and reads process.env.GEMINI_API_KEY' },
      { actor: '3. @google/genai SDK', action: 'Calls ai.models.generateContent({ model: "gemini-4-hydrogen", ... })' },
      { actor: '4. JSON / Stream Reply', action: 'Express sends clean response (or friendly HTTP error) back to UI' },
    ],
    explanation: [
      'A classic newcomer question is: "Since JavaScript runs in the browser, why can’t I just call the AI API straight from React?" Because every line of JavaScript and every `VITE_*` variable sent to the browser can be opened in Chrome DevTools -> Network or Sources tab by any visitor! Anyone could copy your paid API key and run up a huge bill.',
      'In a real Full-Stack Web Developer job, you connect AI in **two halves**: (1) **Frontend (Client)** manages inputs, loading spinners, `fetch()`, and rendering results; (2) **Backend (Server — Node/Express or Next.js API Routes)** holds `process.env.GEMINI_API_KEY`, initializes `new GoogleGenAI(...)`, validates incoming user prompts, and forwards only the safe result.',
      'Notice how clean this boundary is: your backend is also where you check if the user is logged in, log usage analytics into your database, and enforce maximum prompt length before spending a single AI token!',
    ],
    codeBlueprint: {
      backendLabel: 'server.ts (Express Backend AI Route)',
      backendCode: `import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
});

app.post('/api/ai/summarize', async (req, res) => {
  try {
    const text = String(req.body?.text ?? '').trim();
    if (!text || text.length > 4000) {
      return res.status(400).json({ error: 'Text must be 1–4000 characters.' });
    }

    const result = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: 'Summarize in 2 bullet points:\\n' + text,
    });
    res.json({ summary: result.text ?? '' });
  } catch (err) {
    res.status(502).json({ error: 'AI service temporarily unavailable.' });
  }
});`,
      frontendLabel: 'src/services/aiClient.ts (React Frontend)',
      frontendCode: `export async function requestSummary(text: string): Promise<string> {
  const res = await fetch('/api/ai/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || 'Failed to generate summary');
  }
  return payload.summary;
}`,
    },
    commonMistake: {
      label: 'Calling the AI SDK or putting GEMINI_API_KEY inside client-side browser files',
      avoid: `// Inside src/App.tsx (BROWSER CODE!)
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY }); // Key leaks in bundle!`,
      prefer: `// Browser calls your own backend endpoint:
const res = await fetch('/api/ai/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text }),
});`,
    },
    practice: {
      taskPrompt:
        'Test this simulated Frontend -> Express Backend Proxy pipeline. Try submitting an empty string, an oversized string (>100 chars), or valid text to watch backend validation protect the AI route.',
      starterHtml: `<div class="box">
  <h1>Full-Stack API Proxy Simulator</h1>
  <input id="topic-in" type="text" value="Explain async/await simply" />
  <button id="btn-send" type="button">POST /api/ai/explain</button>
  <div id="out" class="out">Ready to send request through backend proxy</div>
</div>`,
      starterCss: AI_CSS,
      starterJs: `// Simulated Express Backend Endpoint (runs on server in real apps)
async function serverPostExplain(reqBody) {
  await new Promise((r) => setTimeout(r, 250));
  const prompt = String(reqBody?.prompt ?? '').trim();
  if (!prompt) {
    return { ok: false, status: 400, json: async () => ({ error: 'Prompt cannot be empty.' }) };
  }
  if (prompt.length > 100) {
    return { ok: false, status: 413, json: async () => ({ error: 'Prompt exceeds 100-char server limit.' }) };
  }
  // Server calls AI with secret process.env.GEMINI_API_KEY
  return {
    ok: true,
    status: 200,
    json: async () => ({ answer: '[Server AI Reply] Key takeaway for "' + prompt + '": Always await inside try/catch!' }),
  };
}

// Simulated Frontend UI Handler
document.getElementById('btn-send').addEventListener('click', async () => {
  const out = document.getElementById('out');
  const prompt = document.getElementById('topic-in').value;
  out.textContent = 'Calling POST /api/ai/explain...';
  try {
    const res = await serverPostExplain({ prompt });
    const data = await res.json();
    if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + data.error);
    out.textContent = data.answer;
    console.log('200 OK:', data);
  } catch (err) {
    out.textContent = 'Frontend caught error -> ' + err.message;
    console.warn(err.message);
  }
});`,
      solutionJs: `async function serverPostExplain(reqBody) {
  const prompt = String(reqBody?.prompt ?? '').trim();
  if (!prompt) return { ok: false, status: 400, json: async () => ({ error: 'Prompt required' }) };
  return { ok: true, status: 200, json: async () => ({ answer: 'AI response for: ' + prompt }) };
}
document.getElementById('btn-send').addEventListener('click', async () => {
  const res = await serverPostExplain({ prompt: document.getElementById('topic-in').value });
  const data = await res.json();
  document.getElementById('out').textContent = res.ok ? data.answer : 'Error: ' + data.error;
});`,
    },
    quiz: [
      {
        question: 'Where must `new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })` ALWAYS be executed in a full-stack web app?',
        options: [
          'Inside the React `App.tsx` component',
          'Inside a server-side API route (Node/Express/Next.js) so the key stays private',
          'Inside `localStorage` on the user’s browser',
        ],
        correctIndex: 1,
        explanation:
          'Server-side routes keep `GEMINI_API_KEY` out of client bundles and let you enforce authentication, validation, and rate limits.',
      },
      {
        question: 'Why should your backend check `prompt.length` and user permissions BEFORE calling the AI model?',
        options: [
          'To prevent abusive giant payloads from draining API credits or bypassing app rules',
          'Because browsers cannot send strings longer than 10 characters',
          'To convert JavaScript into Python',
        ],
        correctIndex: 0,
        explanation:
          'Input validation on your backend protects both your wallet (token costs) and your security boundaries before invoking the LLM.',
      },
    ],
  },
  {
    id: 'ai03-prompt-engineering-system',
    number: 3,
    stageId: 'stage-1-foundations',
    stageTitle: 'Stage 1: AI Basics for Web Developers',
    levelLabel: 'Beginner Friendly',
    title: 'System Instructions & Prompt Engineering in Code',
    jobRoleFocus: 'Separating App Behavior Rules from Untrusted User Inputs',
    summary:
      'Learn how to write reliable prompts inside code using `systemInstruction`, clear formatting constraints, and few-shot examples—instead of hoping vague user prompts behave nicely.',
    keyTakeaway:
      'Put your app’s persona, tone, and rules inside `config.systemInstruction` on the server, and pass user-supplied text separately in `contents` with clear delimiters.',
    architectureSteps: [
      { actor: '1. Server Rules', action: 'config.systemInstruction locks persona, audience, and format' },
      { actor: '2. Prompt Template', action: 'Backend wraps user data cleanly with XML/triple-quote delimiters' },
      { actor: '3. Few-Shot Samples', action: 'Optional 1–2 input/output examples boost format consistency' },
      { actor: '4. Focused Output', action: 'AI returns concise, predictable results ready for your UI' },
    ],
    explanation: [
      'When building AI features for a company, you cannot tell users "please write a detailed 5-line prompt." Users type 3 messy words like `"fix resume"`! Your job as a Full-Stack Developer is to turn messy clicks or short inputs into rock-solid instructions behind the scenes.',
      'Modern APIs separate two channels: **`systemInstruction`** (developer-owned rules: who the AI is, what tone to use, what length to write, and what it must refuse) and **`contents`** (the actual user data or task). Keeping these separate makes outputs far more consistent.',
      'A reliable formula for production prompt engineering is **Role + Context + Task + Constraints + Few-Shot Example**. For example, telling the model `"Output max 3 bullet points under 15 words each; never invent pricing"` removes 90% of rambling output.',
    ],
    codeBlueprint: {
      backendLabel: 'server/routes/rewriteBio.ts',
      backendCode: `const response = await ai.models.generateContent({
  model: 'gemini-4-hydrogen',
  contents: \`Rewrite this student bio for a developer portfolio:
<student_bio>
\${userBio}
</student_bio>\`,
  config: {
    systemInstruction:
      'You are an experienced tech career coach. Keep the bio factual, ' +
      'confident, and under 60 words. Do not invent degrees or companies ' +
      'not mentioned in <student_bio>.',
  },
});`,
      frontendLabel: 'client/BioHelper.tsx',
      frontendCode: `// Frontend sends ONLY structured form values—never raw prompt templates!
const res = await fetch('/api/ai/rewrite-bio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userBio: draftText, targetRole: 'Full-Stack' }),
});`,
    },
    commonMistake: {
      label: 'Sending the system prompt from the frontend browser (where users can edit it in DevTools)',
      avoid: `// Client sends full system instructions in POST body!
fetch('/api/chat', {
  body: JSON.stringify({ system: 'You are a tutor...', user: msg })
});`,
      prefer: `// Client sends ONLY user input; SERVER applies trusted systemInstruction!
fetch('/api/chat', {
  body: JSON.stringify({ message: msg })
});`,
    },
    practice: {
      taskPrompt:
        'Test how combining a server-side `systemInstruction` + XML delimiters (`<user_input>`) keeps prompts clean even when user input contains messy text.',
      starterHtml: `<div class="box">
  <h1>Prompt Assembler Practice</h1>
  <select id="tone">
    <option value="beginner">Tone: Friendly Teacher (Beginner)</option>
    <option value="concise">Tone: Senior Code Reviewer (Concise)</option>
  </select>
  <input id="concept" type="text" value="Explain Promise.all in web apps" />
  <button id="btn-build" type="button">Assemble Server Prompt Payload</button>
  <div id="out" class="out">Click to inspect the structured API payload</div>
</div>`,
      starterCss: AI_CSS,
      starterJs: `const SYSTEM_PRESETS = {
  beginner: 'You are a patient BCA web dev teacher. Explain in 3 short sentences with 1 everyday analogy.',
  concise: 'You are a principal engineer. Respond in 2 bullet points focusing on production trade-offs.',
};

document.getElementById('btn-build').addEventListener('click', () => {
  const tone = document.getElementById('tone').value;
  const userText = document.getElementById('concept').value.trim();

  const requestPayload = {
    model: 'gemini-4-hydrogen',
    config: {
      systemInstruction: SYSTEM_PRESETS[tone],
    },
    contents: '<user_question>\\n' + userText + '\\n</user_question>',
  };

  document.getElementById('out').textContent = JSON.stringify(requestPayload, null, 2);
  console.log('Assembled payload:', requestPayload);
});`,
      solutionJs: `const SYSTEM_PRESETS = {
  beginner: 'You are a patient BCA web dev teacher. Keep answers clear with 1 analogy.',
  concise: 'You are a senior full-stack reviewer. Give 2 concise production bullet points.',
};
document.getElementById('btn-build').addEventListener('click', () => {
  const tone = document.getElementById('tone').value;
  const userText = document.getElementById('concept').value.trim();
  const payload = {
    model: 'gemini-4-hydrogen',
    config: { systemInstruction: SYSTEM_PRESETS[tone] },
    contents: '<user_question>\\n' + userText + '\\n</user_question>',
  };
  document.getElementById('out').textContent = JSON.stringify(payload, null, 2);
});`,
    },
    quiz: [
      {
        question: 'Why should `systemInstruction` live on your backend server rather than being sent from the React frontend?',
        options: [
          'Because anyone can alter frontend `fetch()` bodies in browser DevTools to overwrite your app’s rules',
          'Because JavaScript strings do not work inside React',
          'Because `systemInstruction` only works with CSS files',
        ],
        correctIndex: 0,
        explanation:
          'Never trust client-supplied system prompts; keeping `systemInstruction` on the backend guarantees your persona and safety constraints stay intact.',
      },
      {
        question: 'Why wrap untrusted user text inside delimiters like `<user_input>...</user_input>`?',
        options: [
          'It translates text into HTML tables automatically',
          'It clearly separates your instructions from user-supplied data so the model knows what is data to process',
          'It reduces token count by 90%',
        ],
        correctIndex: 1,
        explanation:
          'Clear delimiters help the model distinguish trusted developer instructions from raw user content.',
      },
    ],
  },
  {
    id: 'ai04-structured-json-outputs',
    number: 4,
    stageId: 'stage-2-integration',
    stageTitle: 'Stage 2: Connecting Frontend + Backend to AI',
    levelLabel: 'Full-Stack Core',
    title: 'Structured JSON Outputs & responseSchema (AI -> UI Components)',
    jobRoleFocus: 'Turning AI Responses into Typed JSON for Tables, Badges & Forms',
    summary:
      'In real web apps, users don’t always want a chat box! Learn how `responseMimeType: "application/json"` and `responseSchema` force AI to return exact JSON objects your React components can `.map()` over.',
    keyTakeaway:
      'Use `responseMimeType: "application/json"` + `responseSchema` (`Type.OBJECT`, `Type.ARRAY`) whenever your UI needs structured fields (tags, scores, tasks, cards) instead of free-form paragraphs.',
    architectureSteps: [
      { actor: '1. Define Schema', action: 'Backend specifies exact JSON shape via Type.OBJECT / Type.ARRAY' },
      { actor: '2. Constrained AI', action: 'Gemini guarantees valid JSON matching your responseSchema' },
      { actor: '3. Parse & Guard', action: 'Server parses JSON.parse(response.text) safely' },
      { actor: '4. Rich UI Render', action: 'React renders cards, tables, or autofills forms cleanly' },
    ],
    explanation: [
      'Beginners often think "AI in web dev = chatbot." In fact, most high-value full-stack AI features are **invisible workflows**: auto-extracting invoice fields, tagging support tickets, generating study quizzes, or scoring resumes. Those UI screens need clean JSON arrays/objects, NOT markdown paragraphs wrapped in ```json fences!',
      'With `@google/genai`, you pass `responseMimeType: "application/json"` and a `responseSchema` built using `Type` (`Type.OBJECT`, `Type.ARRAY`, `Type.STRING`, `Type.NUMBER`). The model is constrained at generation time so its output matches your schema.',
      'Even with `responseSchema`, defensive full-stack engineers ALWAYS parse with `JSON.parse(response.text ?? "{}")` inside a `try/catch` on the server before sending typed JSON to the frontend.',
    ],
    codeBlueprint: {
      backendLabel: 'server/routes/analyzeTask.ts',
      backendCode: `import { GoogleGenAI, Type } from '@google/genai';

const response = await ai.models.generateContent({
  model: 'gemini-4-hydrogen',
  contents: 'Break this goal into 3 actionable subtasks: ' + goal,
  config: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING },
        estimatedHours: { type: Type.NUMBER },
        subtasks: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['category', 'estimatedHours', 'subtasks'],
    },
  },
});

const plan = JSON.parse(response.text ?? '{}');
res.json(plan);`,
      frontendLabel: 'client/TaskPlanner.tsx',
      frontendCode: `const plan = await res.json();
// Directly render typed fields—zero fragile string splitting!
return (
  <div>
    <h3>{plan.category} (~{plan.estimatedHours}h)</h3>
    <ul>{plan.subtasks.map((step, i) => <li key={i}>{step}</li>)}</ul>
  </div>
);`,
    },
    commonMistake: {
      label: 'Asking "Please reply ONLY in JSON" in plain text and crashing when AI adds ```json fences',
      avoid: `// Fragile prompt-only JSON often returns "\`\`\`json\\n{...}\\n\`\`\`"
const obj = JSON.parse(response.text); // SyntaxError crashes app!`,
      prefer: `// Enforce schema at the API level with responseMimeType + responseSchema!
config: {
  responseMimeType: 'application/json',
  responseSchema: { type: Type.OBJECT, properties: { ... } },
}`,
    },
    practice: {
      taskPrompt:
        'Test validating and rendering a structured AI JSON response into clean UI cards—and see how a schema check catches missing fields safely.',
      starterHtml: `<div class="box">
  <h1>Structured JSON AI Renderer</h1>
  <button id="btn-valid" type="button">Render Valid Structured JSON</button>
  <button id="btn-bad" type="button" class="secondary">Test Broken JSON Guard</button>
  <div id="cards"></div>
  <div id="out" class="out">Click to parse & render structured AI data</div>
</div>`,
      starterCss: AI_CSS,
      starterJs: `const validAiPayload = JSON.stringify({
  category: 'Portfolio Upgrade',
  estimatedHours: 4,
  subtasks: [
    'Build Express /api/ai proxy route',
    'Render JSON responseSchema cards in React',
    'Add loading & error states',
  ],
});

function renderStructuredPlan(rawJson) {
  const cardsEl = document.getElementById('cards');
  const outEl = document.getElementById('out');
  cardsEl.innerHTML = '';

  try {
    const data = JSON.parse(rawJson);
    if (!data.category || !Array.isArray(data.subtasks)) {
      throw new Error('Response does not match expected schema');
    }

    const card = document.createElement('div');
    card.className = 'card';
    const title = document.createElement('strong');
    title.textContent = data.category + ' · Est. ' + data.estimatedHours + ' hrs';
    card.appendChild(title);

    const ul = document.createElement('ul');
    data.subtasks.forEach((step) => {
      const li = document.createElement('li');
      li.textContent = step;
      ul.appendChild(li);
    });
    card.appendChild(ul);
    cardsEl.appendChild(card);
    outEl.textContent = 'Rendered ' + data.subtasks.length + ' typed subtasks cleanly!';
  } catch (err) {
    outEl.textContent = 'Safe Guard Caught Error: ' + err.message;
  }
}

document.getElementById('btn-valid').addEventListener('click', () => renderStructuredPlan(validAiPayload));
document.getElementById('btn-bad').addEventListener('click', () => renderStructuredPlan('Sure! Here is invalid JSON: {broken'));`,
      solutionJs: `function renderStructuredPlan(rawJson) {
  const cardsEl = document.getElementById('cards');
  const outEl = document.getElementById('out');
  cardsEl.innerHTML = '';
  try {
    const data = JSON.parse(rawJson);
    if (!data.category || !Array.isArray(data.subtasks)) throw new Error('Schema mismatch');
    const card = document.createElement('div');
    card.className = 'card';
    const heading = document.createElement('strong');
    heading.textContent = data.category + ' (' + data.estimatedHours + 'h)';
    card.appendChild(heading);
    const ul = document.createElement('ul');
    data.subtasks.forEach((s) => {
      const li = document.createElement('li');
      li.textContent = s;
      ul.appendChild(li);
    });
    card.appendChild(ul);
    cardsEl.appendChild(card);
    outEl.textContent = 'Valid schema rendered!';
  } catch (err) {
    outEl.textContent = 'Caught: ' + err.message;
  }
}
document.getElementById('btn-valid').addEventListener('click', () =>
  renderStructuredPlan(JSON.stringify({ category: 'Portfolio', estimatedHours: 4, subtasks: ['Build API', 'Connect UI'] }))
);
document.getElementById('btn-bad').addEventListener('click', () => renderStructuredPlan('{invalid'));`,
    },
    quiz: [
      {
        question: 'Which `@google/genai` config options guarantee structured JSON matching your TypeScript UI shape?',
        options: [
          '`responseMimeType: "application/json"` with `responseSchema` using `Type`',
          '`format: "markdown"`',
          '`allowJson: true`',
        ],
        correctIndex: 0,
        explanation:
          'Setting `responseMimeType: "application/json"` alongside `responseSchema` forces the model to emit valid JSON matching your defined schema.',
      },
      {
        question: 'Why are structured JSON outputs essential for full-stack web apps beyond chatbots?',
        options: [
          'They allow frontend components to render tables, tags, scores, and form fields directly via `.map()`',
          'They eliminate the need for CSS',
          'They run the AI model inside HTML without JavaScript',
        ],
        correctIndex: 0,
        explanation: 'Typed JSON connects AI intelligence straight into interactive UI components without fragile regex parsing.',
      },
    ],
  },
  {
    id: 'ai05-streaming-sse-ui',
    number: 5,
    stageId: 'stage-2-integration',
    stageTitle: 'Stage 2: Connecting Frontend + Backend to AI',
    levelLabel: 'Full-Stack Core',
    title: 'Real-Time Streaming Responses (SSE & ReadableStream)',
    jobRoleFocus: 'Delivering Instant Word-by-Word UX with Stop-Generation Controls',
    summary:
      'Replace sluggish 10-second loading spinners with live token streaming using `ai.models.generateContentStream()`, Express Server-Sent Events (SSE), `response.body.getReader()`, and `AbortController`.',
    keyTakeaway:
      'Streaming prints the first words in ~300ms instead of waiting 8 seconds for the whole paragraph! Stream from Express (`res.write`), read chunks incrementally on the frontend (`getReader()`), and wire `AbortController` to a Cancel button.',
    architectureSteps: [
      { actor: '1. Express SSE Route', action: 'Sets Content-Type: text/event-stream and opens stream' },
      { actor: '2. generateContentStream', action: 'Server iterates for await (const chunk of stream)' },
      { actor: '3. Frontend getReader()', action: 'Browser decodes Uint8Array chunks with TextDecoder' },
      { actor: '4. Live React State', action: 'Appends chunk.text immediately + supports AbortController stop' },
    ],
    explanation: [
      'A full-page AI answer can take 5–12 seconds to finish generating. If your backend waits until the entire `generateContent()` call completes before replying, the user stares at a frozen spinner and thinks the site crashed.',
      'Instead, modern AI apps use **Streaming**: on the server, call `await ai.models.generateContentStream(...)` and iterate `for await (const chunk of stream)`, pushing each `chunk.text` piece immediately over **Server-Sent Events (`text/event-stream`)**.',
      'On the frontend, instead of calling `await res.json()` (which waits for the whole body to finish), you read `const reader = res.body.getReader()` in a `while` loop using `TextDecoder`, updating UI text chunk-by-chunk—and passing an `AbortController` signal so users can click "Stop Generating" anytime!',
    ],
    codeBlueprint: {
      backendLabel: 'server/routes/stream.ts (Express SSE)',
      backendCode: `app.post('/api/ai/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await ai.models.generateContentStream({
    model: 'gemini-4-hydrogen',
    contents: String(req.body.prompt || ''),
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      res.write('data: ' + JSON.stringify({ text: chunk.text }) + '\\n\\n');
    }
  }
  res.write('data: [DONE]\\n\\n');
  res.end();
});`,
      frontendLabel: 'client/useAiStream.ts (Browser Stream Reader)',
      frontendCode: `const controller = new AbortController();
const res = await fetch('/api/ai/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt }),
  signal: controller.signal,
});

const reader = res.body!.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunkText = decoder.decode(value, { stream: true });
  setOutput((prev) => prev + chunkText);
}`,
    },
    commonMistake: {
      label: 'Calling await res.json() on a streaming endpoint or forgetting AbortController cleanup',
      avoid: `// Buffers the ENTIRE stream until finished—defeating streaming UX!
const data = await res.json();`,
      prefer: `// Read chunks incrementally with getReader() + TextDecoder
const reader = res.body.getReader();
const decoder = new TextDecoder();`,
    },
    practice: {
      taskPrompt:
        'Click "Start Token Stream" to watch simulated SSE chunks appear word-by-word in real time, and click "Stop Generating" mid-stream to trigger `AbortController` cancellation.',
      starterHtml: `<div class="box">
  <h1>AI Streaming & AbortController Lab</h1>
  <button id="btn-stream" type="button">Start Token Stream</button>
  <button id="btn-stop" type="button" class="danger">Stop Generating</button>
  <div id="out" class="out">Click Start Token Stream to watch live chunks...</div>
</div>`,
      starterCss: AI_CSS,
      starterJs: `const tokens = ['Full-stack ', 'AI ', 'apps ', 'feel ', 'instant ', 'because ', 'tokens ', 'stream ', 'live ', 'via ', 'SSE ', 'while ', 'AbortController ', 'lets ', 'users ', 'cancel ', 'anytime!'];
let controller = null;
const out = document.getElementById('out');

document.getElementById('btn-stream').addEventListener('click', async () => {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;
  out.textContent = '';

  try {
    for (const token of tokens) {
      if (signal.aborted) throw new Error('Stream aborted by user');
      await new Promise((res, rej) => {
        const id = setTimeout(res, 110);
        signal.addEventListener('abort', () => { clearTimeout(id); rej(new Error('Aborted')); }, { once: true });
      });
      out.textContent += token;
    }
    console.log('Stream finished cleanly');
  } catch (err) {
    out.textContent += '\\n[Stopped]';
    console.warn(err.message);
  }
});

document.getElementById('btn-stop').addEventListener('click', () => {
  controller?.abort();
});`,
      solutionJs: `const tokens = ['Streaming ', 'renders ', 'words ', 'immediately ', 'using ', 'SSE ', 'and ', 'AbortController!'];
let controller = null;
const out = document.getElementById('out');

document.getElementById('btn-stream').addEventListener('click', async () => {
  controller?.abort();
  controller = new AbortController();
  out.textContent = '';
  for (const t of tokens) {
    if (controller.signal.aborted) break;
    await new Promise((r) => setTimeout(r, 120));
    if (!controller.signal.aborted) out.textContent += t;
  }
});
document.getElementById('btn-stop').addEventListener('click', () => controller?.abort());`,
    },
    quiz: [
      {
        question: 'Why do full-stack AI apps stream tokens over SSE instead of waiting for a single JSON response?',
        options: [
          'Users see the first words within milliseconds, dramatically improving perceived speed on long answers',
          'Streaming bypasses the need for a backend server',
          'JSON cannot contain spaces',
        ],
        correctIndex: 0,
        explanation:
          'Streaming delivers tokens as they are generated, reducing perceived latency from several seconds down to fractions of a second.',
      },
      {
        question: 'Which browser API lets a user click "Stop Generating" to cancel an in-flight `fetch()` AI stream?',
        options: ['`localStorage`', '`AbortController` (`signal`)', '`JSON.stringify()`'],
        correctIndex: 1,
        explanation:
          'Passing `signal: controller.signal` into `fetch()` allows `controller.abort()` to terminate the HTTP stream cleanly.',
      },
    ],
  },
];
