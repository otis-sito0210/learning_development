import axios from "axios";

interface Form {
  id: string;
  name: string;
  interviewTopic: string;
  systemPrompt: string;
  initialQuestion: string;
  formTitle?: string | null;
  formDescription?: string | null;
}

interface WorkflowData {
  workflowId: string;
  webhookUrl: string;
  googleSheetId?: string;
  googleSheetUrl?: string;
}

const N8N_API_URL = process.env.N8N_API_URL || "http://localhost:5678";
const N8N_API_KEY = process.env.N8N_API_KEY;

/**
 * Generates an n8n workflow for the given form
 * This creates a conversational interview workflow based on the form configuration
 */
export async function generateN8nWorkflow(form: Form): Promise<WorkflowData> {
  if (!N8N_API_KEY) {
    throw new Error("N8N_API_KEY is not configured");
  }

  const workflowName = `${form.name} - Interview Form`;

  // Generate the workflow JSON based on the template
  const workflowJson = generateWorkflowJson(form);

  try {
    // Create workflow in n8n
    const response = await axios.post(
      `${N8N_API_URL}/api/v1/workflows`,
      {
        name: workflowName,
        nodes: workflowJson.nodes,
        connections: workflowJson.connections,
        settings: {
          saveDataErrorExecution: "all",
          saveDataSuccessExecution: "all",
          saveExecutionProgress: false,
          saveManualExecutions: false,
        },
        active: false,
      },
      {
        headers: {
          "X-N8N-API-KEY": N8N_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const workflowId = response.data.id;

    // Activate the workflow
    await axios.patch(
      `${N8N_API_URL}/api/v1/workflows/${workflowId}`,
      { active: true },
      {
        headers: {
          "X-N8N-API-KEY": N8N_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract webhook URL from the workflow
    const webhookNode = workflowJson.nodes.find(
      (node: any) => node.name === "Start Interview"
    );
    const webhookPath = webhookNode?.parameters?.options?.path || "interview";
    const webhookUrl = `${N8N_API_URL}/form/${webhookPath}`;

    // TODO: Create Google Sheet and return sheet ID/URL
    // For now, we'll use a placeholder
    const googleSheetId = process.env.GOOGLE_SHEET_ID;
    const googleSheetUrl = googleSheetId
      ? `https://docs.google.com/spreadsheets/d/${googleSheetId}`
      : undefined;

    return {
      workflowId,
      webhookUrl,
      googleSheetId,
      googleSheetUrl,
    };
  } catch (error) {
    console.error("Error creating n8n workflow:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response data:", error.response?.data);
    }
    throw new Error("Failed to create n8n workflow");
  }
}

/**
 * Generates the workflow JSON structure based on the form configuration
 */
function generateWorkflowJson(form: Form) {
  // Generate a unique webhook ID for this form
  const webhookId = `form-${form.id}`;
  const webhookPath = `interview-${form.id}`;

  return {
    nodes: [
      {
        parameters: {
          formTitle: form.formTitle || form.name,
          formDescription:
            form.formDescription ||
            `Thanks for taking part in our Interview. You will be presented with an unending series of questions to help us with our research.

The interviewer is an AI agent and the questions are dynamically generated. When you're done answering, simply say STOP to exit the interview.`,
          formFields: {
            values: [
              {
                fieldLabel: form.initialQuestion,
                placeholder: "ie. Sam Smith",
                requiredField: true,
              },
            ],
          },
          responseMode: "lastNode",
          options: {
            appendAttribution: true,
            buttonLabel: "Begin Interview!",
            path: webhookPath,
            ignoreBots: true,
            useWorkflowTimezone: true,
          },
        },
        type: "n8n-nodes-base.formTrigger",
        typeVersion: 2.2,
        position: [-740, -220],
        id: "start-interview",
        name: "Start Interview",
        webhookId: webhookId,
      },
      {
        parameters: {
          assignments: {
            assignments: [
              {
                id: "answer-1",
                name: "answer",
                value: `=Hello, my name is {{ $json['${form.initialQuestion}'] }}`,
                type: "string",
              },
              {
                id: "topic-1",
                name: "interview_topic",
                value: form.interviewTopic,
                type: "string",
              },
            ],
          },
          options: {},
        },
        type: "n8n-nodes-base.set",
        typeVersion: 3.4,
        position: [-360, -220],
        id: "set-interview-topic",
        name: "Set Interview Topic",
      },
      {
        parameters: {
          promptType: "define",
          text: "={{ $json.answer }}",
          options: {
            systemMessage: form.systemPrompt,
          },
        },
        type: "@n8n/n8n-nodes-langchain.agent",
        typeVersion: 1.7,
        position: [40, -160],
        id: "ai-researcher",
        name: "AI Researcher",
      },
      {
        parameters: {
          sessionIdType: "customKey",
          sessionKey: `={{ $('Start Interview').first().json['${form.initialQuestion}'] }}-{{ $now.format('yyyy-MM-dd-HH-mm') }}`,
          contextWindowLength: 15,
        },
        type: "@n8n/n8n-nodes-langchain.memoryBufferWindow",
        typeVersion: 1.3,
        position: [100, 40],
        id: "window-buffer-memory",
        name: "Window Buffer Memory",
      },
      {
        parameters: {
          conditions: {
            options: {
              caseSensitive: true,
              leftValue: "",
              typeValidation: "strict",
              version: 2,
            },
            conditions: [
              {
                id: "stop-condition",
                leftValue: "={{ $json.output.stop_interview }}",
                rightValue: "",
                operator: {
                  type: "boolean",
                  operation: "true",
                  singleValue: true,
                },
              },
            ],
            combinator: "and",
          },
          options: {},
        },
        type: "n8n-nodes-base.if",
        typeVersion: 2.2,
        position: [500, -160],
        id: "stop-interview",
        name: "Stop Interview?",
      },
      {
        parameters: {
          formFields: {
            values: [
              {
                fieldLabel: "answer",
                fieldType: "textarea",
                requiredField: true,
              },
            ],
          },
          options: {
            formTitle: "={{ $json.output.question }}",
            formDescription:
              'Please answer the question or type "stop interview" to end the interview.',
            buttonLabel: "Next Question",
          },
        },
        type: "n8n-nodes-base.form",
        typeVersion: 1,
        position: [840, 220],
        id: "get-answer",
        name: "Get Answer",
        webhookId: `${webhookId}-answer`,
      },
      {
        parameters: {
          operation: "completion",
          completionTitle: "Thanks for Completing the Interview!",
          completionMessage:
            "Your answers have been recorded and we'll be in touch soon!",
          options: {},
        },
        type: "n8n-nodes-base.form",
        typeVersion: 1,
        position: [1480, -420],
        id: "show-completion",
        name: "Show Completion",
        webhookId: `${webhookId}-completion`,
      },
    ],
    connections: {
      "Start Interview": {
        main: [[{ node: "Set Interview Topic", type: "main", index: 0 }]],
      },
      "Set Interview Topic": {
        main: [[{ node: "AI Researcher", type: "main", index: 0 }]],
      },
      "AI Researcher": {
        main: [[{ node: "Stop Interview?", type: "main", index: 0 }]],
      },
      "Window Buffer Memory": {
        ai_memory: [[{ node: "AI Researcher", type: "ai_memory", index: 0 }]],
      },
      "Stop Interview?": {
        main: [
          [{ node: "Show Completion", type: "main", index: 0 }],
          [{ node: "Get Answer", type: "main", index: 0 }],
        ],
      },
      "Get Answer": {
        main: [[{ node: "AI Researcher", type: "main", index: 0 }]],
      },
    },
    pinData: {},
  };
}

/**
 * Deletes an n8n workflow
 */
export async function deleteN8nWorkflow(workflowId: string): Promise<void> {
  if (!N8N_API_KEY) {
    throw new Error("N8N_API_KEY is not configured");
  }

  try {
    await axios.delete(`${N8N_API_URL}/api/v1/workflows/${workflowId}`, {
      headers: {
        "X-N8N-API-KEY": N8N_API_KEY,
      },
    });
  } catch (error) {
    console.error("Error deleting n8n workflow:", error);
    throw new Error("Failed to delete n8n workflow");
  }
}
