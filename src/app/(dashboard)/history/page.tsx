import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session!);

  const [studySessions, testAttempts] = await Promise.all([
    prisma.studySession.findMany({
      where: { flashcardSet: { course: { userId } } },
      include: {
        flashcardSet: { include: { course: true } },
        responses: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.testAttempt.findMany({
      where: { questionSet: { course: { userId } }, completedAt: { not: null } },
      include: {
        questionSet: { include: { course: true } },
        _count: { select: { answers: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Study History</h1>

      {/* Study Sessions */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Flashcard Sessions</h2>
        </CardHeader>
        <CardContent>
          {studySessions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No study sessions yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {studySessions.map((s) => {
                const known = s.responses.filter((r) => r.known).length;
                const total = s.responses.length;
                const score = total > 0 ? Math.round((known / total) * 100) : 0;

                return (
                  <div key={s.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{s.flashcardSet.name}</p>
                      <p className="text-xs text-gray-500">
                        {s.flashcardSet.course.name} &middot;{" "}
                        {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {known}/{total} known
                      </span>
                      <Badge variant={score >= 70 ? "success" : score >= 50 ? "warning" : "error"}>
                        {score}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Attempts */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Test Attempts</h2>
        </CardHeader>
        <CardContent>
          {testAttempts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No test attempts yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {testAttempts.map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t.questionSet.name}</p>
                    <p className="text-xs text-gray-500">
                      {t.questionSet.course.name} &middot;{" "}
                      {new Date(t.createdAt).toLocaleDateString()} &middot;{" "}
                      {t._count.answers} questions
                    </p>
                  </div>
                  <Badge
                    variant={
                      (t.score ?? 0) >= 70
                        ? "success"
                        : (t.score ?? 0) >= 50
                          ? "warning"
                          : "error"
                    }
                  >
                    {Math.round(t.score ?? 0)}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
