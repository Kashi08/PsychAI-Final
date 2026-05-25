import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { patient } = await req.json();
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      summary: 'Groq API key not configured. Add GROQ_API_KEY to your .env.local file to enable AI clinical summaries.'
    });
  }

  const moodAvg = patient.mood_history
    ? (patient.mood_history.reduce((a: number, m: any) => a + m.score, 0) / patient.mood_history.length).toFixed(1)
    : 'N/A';

  const prompt = `You are a clinical psychologist assistant. Generate a concise clinical summary for the following patient. Be professional, empathetic, and clinically precise. Keep it to 3-4 sentences.

Patient: ${patient.name}, Age ${patient.age}
Primary diagnosis: ${patient.diagnosis}
Risk level: ${patient.risk}
Wellness score: ${patient.wellness}%
PHQ-9 score: ${patient.phq9} (${patient.phq9 >= 20 ? 'Severe' : patient.phq9 >= 15 ? 'Moderately severe' : patient.phq9 >= 10 ? 'Moderate' : 'Mild'})
GAD-7 score: ${patient.gad7} (${patient.gad7 >= 15 ? 'Severe' : patient.gad7 >= 10 ? 'Moderate' : 'Mild'})
Average mood this week: ${moodAvg}/5
Total sessions: ${patient.sessions}
Crisis events: ${patient.crisis_events?.length || 0}

Recent journal excerpt: "${patient.journal_snippets?.[0]?.excerpt || 'None'}"

Write a 3-4 sentence clinical summary covering: current mental state, key concerns, treatment progress, and recommended next steps.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.5,
      }),
    });

    if (!response.ok) throw new Error(`Groq error: ${response.status}`);

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || 'Unable to generate summary.';

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('AI summary error:', error);
    return NextResponse.json({
      summary: `Clinical note: ${patient.name} presents with ${patient.diagnosis}. Current wellness score is ${patient.wellness}% with a PHQ-9 of ${patient.phq9} and GAD-7 of ${patient.gad7}. ${patient.risk === 'HIGH' ? 'Patient is flagged as high risk and requires immediate attention.' : 'Continue current treatment plan and monitor progress.'}`
    });
  }
}
