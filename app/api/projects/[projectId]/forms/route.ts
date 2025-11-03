import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateN8nWorkflow } from "@/lib/n8n-generator";

const formSchema = z.object({
  name: z.string().min(1, "Form name is required"),
  interviewTopic: z.string().min(1, "Interview topic is required"),
  systemPrompt: z.string().optional(),
  initialQuestion: z.string().default("What is your name?"),
  formTitle: z.string().optional(),
  formDescription: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession();

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = formSchema.parse(body);

    // Generate default system prompt if not provided
    const systemPrompt =
      validatedData.systemPrompt ||
      `You are a user research expert interviewing a user on the topic of "${validatedData.interviewTopic}".

* Your task is to ask open-ended questions relevant to the interview topic.
* Ask only one question at a time. Analyse the previous question and ask new question each time. If there is an opportunity to dig deeper into a previous answer, do so but limit to 1 follow-on question.
* Keep asking questions until the user requests to stop the interview. When the user requests to stop the interview and no question is required, "question" is an empty string.
* Output your response in JSON format only. Use this question json schema for every question:
\`\`\`
{
  "stop_interview": false, // boolean
  "question": "..." // string
}
\`\`\`
* Use a friendly and polite tone when asking questions.
* If the user answers are irrelevant to the question, ask the question again or move on to another question.
* If the user's answer is beyond the scope of the interview, ignore the answer and ask if the user would like to stop the interview.`;

    // Create form in database
    const form = await prisma.form.create({
      data: {
        projectId: params.projectId,
        name: validatedData.name,
        interviewTopic: validatedData.interviewTopic,
        systemPrompt: systemPrompt,
        initialQuestion: validatedData.initialQuestion,
        formTitle: validatedData.formTitle || validatedData.name,
        formDescription: validatedData.formDescription,
      },
    });

    // Generate n8n workflow
    try {
      const workflowData = await generateN8nWorkflow(form);

      // Update form with workflow info
      await prisma.form.update({
        where: { id: form.id },
        data: {
          n8nWorkflowId: workflowData.workflowId,
          n8nWebhookUrl: workflowData.webhookUrl,
          googleSheetId: workflowData.googleSheetId,
          googleSheetUrl: workflowData.googleSheetUrl,
          isActive: true,
        },
      });

      return NextResponse.json(
        {
          ...form,
          n8nWorkflowId: workflowData.workflowId,
          n8nWebhookUrl: workflowData.webhookUrl,
          googleSheetId: workflowData.googleSheetId,
          googleSheetUrl: workflowData.googleSheetUrl,
          isActive: true,
        },
        { status: 201 }
      );
    } catch (workflowError) {
      console.error("Error creating n8n workflow:", workflowError);
      // Form created but workflow failed
      return NextResponse.json(
        {
          ...form,
          error: "Form created but workflow generation failed. Please try activating it manually.",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating form:", error);
    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 }
    );
  }
}
