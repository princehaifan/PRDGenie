import { GoogleGenAI } from "@google/genai";
import { fileToBase64 } from './utils';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this context, we assume the key is available.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const getPrdPrompt = () => {
    return `You are PRDGenie, a world-class AI Product Manager and technical writer. Your primary function is to transform unstructured user inputs (text, images) into a clear, structured, and actionable Product Requirement Document (PRD).

A user will provide you with their raw app idea. Analyze the input carefully and generate a comprehensive PRD in Markdown format.

The generated PRD MUST follow this exact structure and include all sections:

---

# Product Requirement Document (PRD)

**App Name (Placeholder): [Generate a creative name for the app]**

---

## 1. One-line summary
[Single sentence: what, for whom, and why.]

## 2. Problem / Context
[Short background. Evidence or signal motivating the work. If no data, state assumption clearly.]

## 3. Goals & Success metrics (KPIs)
[Primary goal (North Star). 3–5 measurable KPIs with baseline and target where possible.]

## 4. Target users & Personas
[2–3 personas: name, short description, key needs, success for them.]

## 5. User journeys / Jobs-to-be-done
[Top 2–3 flows described step-by-step.]

## 6. Scope & MVP
- **Must-haves (MVP):** [List core features]
- **Nice-to-haves (later):** [List potential future features]
- **Out of scope:** [List things that will not be built]

## 7. Functional requirements
[Clear, testable bullets. Use "Shall" statements.]

## 8. Non-functional requirements
[Performance, scale, security, privacy, compliance, accessibility.]

## 9. Acceptance criteria & test cases
[For each major requirement provide 1–3 acceptance tests.]

## 10. UX / UI notes
[Key screens, microcopy examples, simple wireframe descriptions.]

## 11. Data & analytics
[Events to track, dashboards to build, success thresholds.]

## 12. Launch plan & rollout
[Stages (alpha, beta, GA), target segments, feature flags.]

## 13. Monitoring & alerting
[SLOs, dashboards, thresholds, rollback criteria.]

## 14. Risks & mitigations
[Top 5 risks and specific mitigations.]

## 15. Dependencies & stakeholders
[Teams, APIs, third-party vendors, legal.]

## 16. Timeline & milestones
[High-level schedule (weeks or sprints).]

## 17. Open questions & assumptions
[Explicit list; mark what must be answered before launch.]

## 18. Appendix / artifacts
[Sample API spec, data model, mock data.]

---

**Instructions for generation:**
- **Think Deeply:** Go beyond the user's literal input. Suggest new features, potential roadblocks, and market opportunities.
- **Be Actionable:** All requirements should be clear and testable.
- **Cut Fluff:** Use simple words and short sentences. No marketing language.
- **Markdown Only:** The entire output must be a single block of well-formatted Markdown.
- **Analyze Images:** If an image is provided (e.g., a wireframe sketch), analyze it and incorporate the visual ideas into the PRD, especially in the 'UX / UI notes' section.
`;
};


export const generatePrd = async (text: string, files: File[]): Promise<string> => {
  if (!API_KEY) {
    throw new Error("Missing API_KEY. Please set it in your environment variables.");
  }

  const systemInstruction = getPrdPrompt();
  const imageParts = await Promise.all(
    files.filter(file => file.type.startsWith('image/')).map(async (file) => {
      const base64Data = await fileToBase64(file);
      return {
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      };
    })
  );

  const textPart = { text: `Here is the user's idea:\n\n${text}` };

  const userParts = [textPart, ...imageParts];

  try {
    // Fix: Separated system instructions from user content for better model performance and adherence to API guidelines.
    // The main prompt is passed as a systemInstruction, and user inputs (text, images) are passed in contents.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: userParts },
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw new Error('Failed to communicate with the AI model.');
  }
};