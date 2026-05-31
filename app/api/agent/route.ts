import { NextRequest } from "next/server";
import OpenAI from "openai";
import { extractTextFromPDF } from "@/lib/pdf";
import { cvAgentTools, executeTool } from "@/lib/groq";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

// دالة تأخير بسيطة لتجنب تخطي الـ Rate limits الفرعية مجاناً
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("cv") as File;
  const jobTitle = formData.get("jobTitle") as string;
  const jobDescription = formData.get("jobDescription") as string;

  const buffer = Buffer.from(await file.arrayBuffer());
  const cvText = await extractTextFromPDF(buffer);

  const agentSteps: { tool: string; result: unknown }[] = [];

  // تهيئة المصفوفة لتتوافق مع ChatCompletionMessageParam
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: `You are CareerCoach AI Agent. Analyze this candidate's CV for the target job.

Use your tools in this order:
1. extract_cv_skills
2. analyze_job_requirements
3. calculate_match_and_gaps
4. generate_interview_questions
5. build_learning_roadmap

CV Text:
${cvText}

Target Job: ${jobTitle}
Job Description: ${jobDescription}

Start by calling extract_cv_skills.`,
    },
  ];

  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations) {
    iterations++;

    // تأخير نصف ثانية كحماية للـ Loop السريع
    await delay(500);

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      tools: cvAgentTools,
      tool_choice: "auto",
    });

    const modelMessage = response.choices[0].message;
    if (!modelMessage) break;

    // حفظ رد الموديل في سياق المحادثة
    messages.push(modelMessage);

    const toolCalls = modelMessage.tool_calls;
    // إذا لم يطلب الموديل تشغيل أي أداة أخرى، ننهي الـ Loop
    if (!toolCalls || toolCalls.length === 0) break;

    for (const toolCall of toolCalls) {
  // التحقق من أن الأداة هي فعلاً من نوع function لتفادي الاختلافات في الأنواع
  if (toolCall.type === "function" && "function" in toolCall) {
    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments) as Record<string, unknown>;
    
    const result = await executeTool(toolName, toolArgs);

    agentSteps.push({ tool: toolName, result });

    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: JSON.stringify({ result }),
    });
  }
}
  }

  // استخراج البيانات المجمعة من الـ agentSteps بناءً على عمل كل أداة
  const cvData = agentSteps.find((s) => s.tool === "extract_cv_skills")
    ?.result as Record<string, unknown>;
  const matchData = agentSteps.find((s) => s.tool === "calculate_match_and_gaps")
    ?.result as Record<string, unknown>;
  const questions = agentSteps.find(
    (s) => s.tool === "generate_interview_questions"
  )?.result;
  const roadmap = agentSteps.find(
    (s) => s.tool === "build_learning_roadmap"
  )?.result;

  return Response.json({
    agentSteps: agentSteps.map((s) => s.tool),
    cvAnalysis: {
      extractedSkills: (cvData?.skills as string[]) ?? [],
      experienceYears: (cvData?.experienceYears as number) ?? 0,
      educationLevel: (cvData?.educationLevel as string) ?? "",
      strengths: (matchData?.strengths as string[]) ?? [],
      gaps: (matchData?.gaps as string[]) ?? [],
      matchScore: (matchData?.matchScore as number) ?? 0,
    },
    interviewQuestions: questions ?? [],
    roadmap: roadmap ?? [],
  });
}