import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session!);

  const [courses, recentStudySessions, recentTestAttempts] = await Promise.all([
    prisma.course.findMany({
      where: { userId },
      include: {
        _count: { select: { uploads: true, flashcardSets: true, questionSets: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.studySession.findMany({
      where: { flashcardSet: { course: { userId } } },
      include: {
        flashcardSet: { include: { course: true } },
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.testAttempt.findMany({
      where: { questionSet: { course: { userId } } },
      include: {
        questionSet: { include: { course: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {session!.user?.name || "there"}!</p>
        </div>
        <Link href="/courses/new">
          <Button>New Course</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-6">
            <p className="text-3xl font-bold">{courses.length}</p>
            <p className="text-sm text-gray-500">Courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-3xl font-bold">{recentStudySessions.length}</p>
            <p className="text-sm text-gray-500">Recent Study Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-3xl font-bold">{recentTestAttempts.length}</p>
            <p className="text-sm text-gray-500">Recent Test Attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Course List */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Your Courses</h2>
        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              <p>No courses yet.</p>
              <Link href="/courses/new" className="text-blue-600 hover:underline text-sm">
                Create your first course
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="hover:border-blue-300 transition cursor-pointer h-full">
                  <CardContent className="py-5">
                    <h3 className="font-semibold mb-2">{course.name}</h3>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{course._count.uploads} uploads</span>
                      <span>{course._count.flashcardSets} flashcard sets</span>
                      <span>{course._count.questionSets} test sets</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {(recentStudySessions.length > 0 || recentTestAttempts.length > 0) && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {recentStudySessions.map((s) => (
              <Card key={s.id}>
                <CardContent className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Study: {s.flashcardSet.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {s.flashcardSet.course.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {s._count.responses} cards reviewed
                  </span>
                </CardContent>
              </Card>
            ))}
            {recentTestAttempts.map((t) => (
              <Card key={t.id}>
                <CardContent className="py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Test: {t.questionSet.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {t.questionSet.course.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {t.score != null ? `${Math.round(t.score)}%` : "In progress"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
