import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          n8n Researcher Forms
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Create AI-powered conversational forms for your research projects.
          Never-ending interviews with intelligent follow-up questions.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/api/auth/signin"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Sign in with Google
          </Link>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-indigo-600 mb-2">
              1. Create Project
            </h3>
            <p className="text-gray-600">
              Define your research topic and configure the AI interviewer with
              custom instructions.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-indigo-600 mb-2">
              2. Generate Form Link
            </h3>
            <p className="text-gray-600">
              Get a shareable link to your conversational form. Distribute it to
              your participants.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-indigo-600 mb-2">
              3. Collect Responses
            </h3>
            <p className="text-gray-600">
              Answers are automatically saved to Google Sheets and your database
              for easy analysis.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
