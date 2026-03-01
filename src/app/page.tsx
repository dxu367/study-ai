import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">NLP Study Assistant</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-lg">
        Upload your lecture notes and previous exams, then use AI to generate
        flashcards and practice tests.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}
