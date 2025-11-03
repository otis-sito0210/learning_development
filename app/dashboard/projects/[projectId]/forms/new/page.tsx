"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function NewForm() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      interviewTopic: formData.get("interviewTopic"),
      initialQuestion: formData.get("initialQuestion") || "What is your name?",
      formTitle: formData.get("formTitle"),
      formDescription: formData.get("formDescription"),
      systemPrompt: useCustomPrompt ? formData.get("systemPrompt") : undefined,
    };

    try {
      const response = await fetch(`/api/projects/${projectId}/forms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create form");
      }

      router.push(`/dashboard/projects/${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Back to Project
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Create New Form
        </h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Form Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., User Experience Interview 2024"
              />
            </div>

            <div>
              <label
                htmlFor="interviewTopic"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Interview Topic *
              </label>
              <textarea
                id="interviewTopic"
                name="interviewTopic"
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., Your experience with our mobile app"
              />
              <p className="text-xs text-gray-500 mt-1">
                This guides what the AI will ask about during the interview
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Form Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="formTitle"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Form Title (shown to participants)
                  </label>
                  <input
                    type="text"
                    id="formTitle"
                    name="formTitle"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Leave blank to use form name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="formDescription"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Form Description (shown to participants)
                  </label>
                  <textarea
                    id="formDescription"
                    name="formDescription"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Welcome message for participants..."
                  />
                </div>

                <div>
                  <label
                    htmlFor="initialQuestion"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Initial Question
                  </label>
                  <input
                    type="text"
                    id="initialQuestion"
                    name="initialQuestion"
                    defaultValue="What is your name?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Advanced: AI Prompt
                </h3>
                <button
                  type="button"
                  onClick={() => setUseCustomPrompt(!useCustomPrompt)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {useCustomPrompt ? "Use Default" : "Customize"}
                </button>
              </div>

              {useCustomPrompt && (
                <div>
                  <label
                    htmlFor="systemPrompt"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    System Prompt
                  </label>
                  <textarea
                    id="systemPrompt"
                    name="systemPrompt"
                    rows={12}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                    placeholder="Custom instructions for the AI interviewer..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Advanced: Customize how the AI conducts the interview
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Form & Generate Workflow"}
              </button>
              <Link
                href={`/dashboard/projects/${projectId}`}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
