import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are PsychAI, a warm, empathetic mental health companion for students and young professionals in India.

You are NOT a replacement for a licensed therapist. Your role:
- Listen actively and validate feelings without judgment
- Provide evidence-based CBT techniques when helpful
- Offer breathing or grounding exercises for acute anxiety
- Gently encourage professional help when appropriate
- Respond in English or Hinglish based on the user message

Tone: Warm, like a supportive friend who knows mental health. NOT clinical.
Length: 2-4 sentences usually. Longer only when explaining a technique.

If user expresses suicidal ideation or self-harm: respond with compassion first, then gently mention iCall: 9152987821.`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { response: "I'm here for you. Can you tell me more about how you're feeling right now?" },
      { status: 200 }
    );
  }

  try {
    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.filter((m: any) => m.role === 'user' || m.role === 'assistant'),
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        max_tokens: 512,
        temperature: 0.75,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq API error:', err);
      throw new Error(`Groq returned ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "I'm here for you. Tell me more.";

    return NextResponse.json({ response: text, source: 'groq' });

  } catch (error) {
    console.error('Chat API error:', error);
    // Graceful fallback response
    const fallbacks = [
      "I hear you. It takes courage to open up. How long have you been feeling this way?",
      "Thank you for sharing that with me. Can you tell me more about how this has been affecting your day-to-day life?",
      "That sounds really tough. You're not alone in this. What's been the hardest part for you lately?",
      "I'm here with you. Take a slow breath. What's on your mind right now?",
    ];
    const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return NextResponse.json({ response: fallback, source: 'fallback' });
  }
}
