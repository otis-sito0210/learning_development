import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: params.projectId,
      userId: session.user.id,
    },
    include: {
      forms: {
        include: {
          _count: {
            select: {
              responses: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-gray-600">{project.description}</p>
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Forms</h2>
          <Link
            href={`/dashboard/projects/${project.id}/forms/new`}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            + New Form
          </Link>
        </div>

        {project.forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              No forms yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first conversational form to start collecting
              responses from participants.
            </p>
            <Link
              href={`/dashboard/projects/${project.id}/forms/new`}
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Create Form
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {project.forms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {form.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Topic:</span>{" "}
                      {form.interviewTopic}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Responses:</span>{" "}
                      {form._count.responses}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {form.isActive ? (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {form.n8nWebhookUrl && (
                  <div className="bg-gray-50 rounded p-4 mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Form URL (Share this with participants)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={form.n8nWebhookUrl}
                        className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            form.n8nWebhookUrl || ""
                          );
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {form.googleSheetUrl && (
                  <div className="mt-4">
                    <a
                      href={form.googleSheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View Responses in Google Sheets →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
