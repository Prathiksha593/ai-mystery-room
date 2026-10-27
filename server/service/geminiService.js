import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MysterySchema = z.object({
  title: z.string(),
  story: z.string(),
  suspects: z.array(z.object({
    suspectId: z.string(),
    name: z.string(),
    role: z.string(),
    bio: z.string(),
    alibi: z.string(),
    motive: z.string()
  })),
  clues: z.array(z.object({
    clueId: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.enum(['Forensic', 'Digital', 'Physical', 'Documentary', 'Witness'])
  })),
  hints: z.array(z.object({
    hintId: z.string(),
    text: z.string()
  })),
  culpritId: z.string(),
  solutionExplanation: z.string()
});

export const generateMysteryFromGemini = async (premise, difficulty) => {
  const counts = {
    Easy: { suspects: 3, clues: 5, hints: 2 },
    Medium: { suspects: 4, clues: 7, hints: 3 },
    Hard: { suspects: 5, clues: 9, hints: 3 }
  }[difficulty];

  const prompt = `
You are an expert mystery writer and detective game designer.
Create a detailed, suspense-driven murder mystery based on this premise:
"${premise}"

Difficulty Level: ${difficulty}
Required Specifications:
- Exactly ${counts.suspects} suspects. Assign suspectId as "s1", "s2", "s3", etc.
- Exactly ${counts.clues} clues. Assign clueId as "c1", "c2", "c3", etc. Types must be Forensic, Digital, Physical, Documentary, or Witness.
- Exactly ${counts.hints} progressive hints. Assign hintId as "h1", "h2", "h3", etc.
- Designate exactly ONE suspect as the true culprit using their suspectId in culpritId.
- Provide a clear, detailed solutionExplanation connecting clues logically to the culprit.

Return strictly valid JSON matching the schema with no markdown wrappers or extra text.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            story: { type: 'STRING' },
            suspects: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  suspectId: { type: 'STRING' },
                  name: { type: 'STRING' },
                  role: { type: 'STRING' },
                  bio: { type: 'STRING' },
                  alibi: { type: 'STRING' },
                  motive: { type: 'STRING' }
                },
                required: ['suspectId', 'name', 'role', 'bio', 'alibi', 'motive']
              }
            },
            clues: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  clueId: { type: 'STRING' },
                  title: { type: 'STRING' },
                  description: { type: 'STRING' },
                  type: { type: 'STRING', enum: ['Forensic', 'Digital', 'Physical', 'Documentary', 'Witness'] }
                },
                required: ['clueId', 'title', 'description', 'type']
              }
            },
            hints: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  hintId: { type: 'STRING' },
                  text: { type: 'STRING' }
                },
                required: ['hintId', 'text']
              }
            },
            culpritId: { type: 'STRING' },
            solutionExplanation: { type: 'STRING' }
          },
          required: ['title', 'story', 'suspects', 'clues', 'hints', 'culpritId', 'solutionExplanation']
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return MysterySchema.parse(parsed);
  } catch (error) {
    console.error('Gemini Service Error:', error);
    throw new Error(`Failed to generate mystery: ${error.message}`);
  }
};