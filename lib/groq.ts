import OpenAI from "openai";

// إعداد اتصال Groq باستخدام المفتاح من الـ .env.local
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

// تعريف الأدوات بصيغة Groq / OpenAI المتوافقة
export const cvAgentTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "extract_cv_skills",
      description: "Extract skills, experience, and education from CV text",
      parameters: {
        type: "object",
        properties: {
          cvText: {
            type: "string",
            description: "The raw text content of the CV",
          },
        },
        required: ["cvText"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_job_requirements",
      description: "Analyze what skills and experience a job requires",
      parameters: {
        type: "object",
        properties: {
          jobTitle: {
            type: "string",
            description: "The target job title",
          },
          jobDescription: {
            type: "string",
            description: "The job description text",
          },
        },
        required: ["jobTitle", "jobDescription"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "calculate_match_and_gaps",
      description: "Compare candidate skills against job requirements",
      parameters: {
        type: "object",
        properties: {
          candidateSkills: {
            type: "array",
            items: { type: "string" },
            description: "List of candidate skills",
          },
          jobRequirements: {
            type: "array",
            items: { type: "string" },
            description: "List of required job skills",
          },
        },
        required: ["candidateSkills", "jobRequirements"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_interview_questions",
      description: "Generate targeted interview questions",
      parameters: {
        type: "object",
        properties: {
          jobTitle: { type: "string" },
          gaps: {
            type: "array",
            items: { type: "string" },
          },
          strengths: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["jobTitle", "gaps", "strengths"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "build_learning_roadmap",
      description: "Build a 4-week learning roadmap to close skill gaps",
      parameters: {
        type: "object",
        properties: {
          gaps: {
            type: "array",
            items: { type: "string" },
          },
          jobTitle: { type: "string" },
          experienceYears: { type: "number" },
        },
        required: ["gaps", "jobTitle", "experienceYears"],
      },
    },
  },
];

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const modelToUse = "llama-3.3-70b-versatile"; 

  switch (toolName) {
    case "extract_cv_skills": {
      const res = await groq.chat.completions.create({
        model: modelToUse,
        response_format: { type: "json_object" }, // Groq يدعم إجبار الموديل على إرجاع JSON نظيف
        messages: [
          {
            role: "user",
            content: `Extract from this CV and return ONLY JSON structure:
{
  "skills": ["skill1"],
  "experienceYears": 2,
  "educationLevel": "Bachelor's",
  "previousRoles": ["role1"]
}
CV:
${args.cvText}`,
          },
        ],
      });
      return JSON.parse(res.choices[0].message.content ?? "{}");
    }

    case "analyze_job_requirements": {
      const res = await groq.chat.completions.create({
        model: modelToUse,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: `Analyze this job and return ONLY JSON structure:
{
  "requiredSkills": ["skill1"],
  "niceToHave": ["skill1"],
  "experienceRequired": 3,
  "keyResponsibilities": ["resp1"]
}
Job Title: ${args.jobTitle}
Description: ${args.jobDescription}`,
          },
        ],
      });
      return JSON.parse(res.choices[0].message.content ?? "{}");
    }

    case "calculate_match_and_gaps": {
      const candidateSkills = (args.candidateSkills as string[]) ?? [];
      const jobRequirements = (args.jobRequirements as string[]) ?? [];
      const matched = candidateSkills.filter((s) =>
        jobRequirements.some(
          (r) =>
            r.toLowerCase().includes(s.toLowerCase()) ||
            s.toLowerCase().includes(r.toLowerCase())
        )
      );
      const gaps = jobRequirements.filter(
        (r) =>
          !candidateSkills.some(
            (s) =>
              s.toLowerCase().includes(r.toLowerCase()) ||
              r.toLowerCase().includes(s.toLowerCase())
          )
      );
      const matchScore = Math.round(
        (matched.length / Math.max(jobRequirements.length, 1)) * 100
      );
      return { matched, gaps, matchScore, strengths: matched };
    }

    case "generate_interview_questions": {
      const res = await groq.chat.completions.create({
        model: modelToUse,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: `Generate 6 interview questions for ${args.jobTitle}.
Focus on gaps: ${(args.gaps as string[]).join(", ")}
Strengths: ${(args.strengths as string[]).join(", ")}
Return JSON with a "questions" key containing the array:
{
  "questions": [{
    "question": "...",
    "category": "Technical/Behavioral/Situational",
    "difficulty": "easy/medium/hard",
    "sampleAnswer": "..."
  }]
}`,
          },
        ],
      });
      const data = JSON.parse(res.choices[0].message.content ?? "{}");
      return data.questions ?? [];
    }

    case "build_learning_roadmap": {
      const res = await groq.chat.completions.create({
        model: modelToUse,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: `Build a 4-week roadmap for ${args.jobTitle}.
Gaps to close: ${(args.gaps as string[]).join(", ")}
Experience: ${args.experienceYears} years
Return JSON with a "roadmap" key containing the array:
{
  "roadmap": [{
    "week": 1,
    "focus": "...",
    "topics": ["topic1", "topic2"],
    "resources": [{
      "title": "...",
      "url": "https://...",
      "type": "video/article/course"
    }]
  }]
}`,
          },
        ],
      });
      const data = JSON.parse(res.choices[0].message.content ?? "{}");
      return data.roadmap ?? [];
    }

    default:
      return { error: "Unknown tool" };
  }
}