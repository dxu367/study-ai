import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GenerateOptions } from "@/components/generate/generate-options";
import { AddChapterForm } from "./add-chapter-form";
import { DeleteQuestionSet } from "./delete-question-set";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session!);
  const { courseId } = await params;

  const course = await prisma.course.findFirst({
    where: { id: courseId, userId },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: {
          _count: { select: { uploads: true, flashcardSets: true } },
          uploads: {
            where: { processingStatus: "COMPLETED", contentType: "LECTURE_NOTES" },
            select: { id: true },
          },
        },
      },
      uploads: {
        where: { contentType: "PREVIOUS_EXAM" },
        orderBy: { createdAt: "desc" },
      },
      questionSets: {
        include: { _count: { select: { questions: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!course) notFound();

  const examUploads = course.uploads.filter(
    (u) => u.processingStatus === "COMPLETED"
  );

  const chaptersForGenerate = course.chapters.map((c) => ({
    id: c.id,
    name: c.name,
    hasProcessedUploads: c.uploads.length > 0,
  }));

  const hasAnyProcessedChapterUploads = chaptersForGenerate.some((c) => c.hasProcessedUploads);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <p className="text-gray-500">
            {course.chapters.length} chapters
          </p>
        </div>
      </div>

      {/* Chapters */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Chapters</h2>
        </CardHeader>
        <CardContent>
          {course.chapters.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No chapters yet. Add one to get started.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {course.chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/courses/${courseId}/chapters/${chapter.id}`}
                  className="block"
                >
                  <div className="py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 transition">
                    <div>
                      <p className="text-sm font-medium">{chapter.name}</p>
                      <p className="text-xs text-gray-500">
                        {chapter._count.uploads} notes, {chapter._count.flashcardSets} flashcard sets
                      </p>
                    </div>
                    <span className="text-gray-400 text-sm">View &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <AddChapterForm courseId={courseId} />
          </div>
        </CardContent>
      </Card>

      {/* Previous Exams */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Previous Exams</h2>
        </CardHeader>
        <CardContent>
          {course.uploads.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No previous exams uploaded.{" "}
              <Link href={`/courses/${courseId}/upload`} className="text-blue-600 hover:underline">
                Upload one
              </Link>
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {course.uploads.map((upload) => (
                <div key={upload.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                      {upload.fileType === "PDF" ? "PDF" : upload.fileType === "IMAGE" ? "IMG" : "TXT"}
                    </div>
                    <p className="text-sm font-medium">{upload.fileName}</p>
                  </div>
                  <Badge
                    variant={
                      upload.processingStatus === "COMPLETED"
                        ? "success"
                        : upload.processingStatus === "FAILED"
                          ? "error"
                          : "warning"
                    }
                  >
                    {upload.processingStatus.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Practice Test */}
      {hasAnyProcessedChapterUploads && (
        <GenerateOptions
          courseId={courseId}
          chapters={chaptersForGenerate}
          examUploads={examUploads.map((u) => ({ id: u.id, fileName: u.fileName }))}
        />
      )}

      {/* Practice Tests */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Practice Tests</h2>
        </CardHeader>
        <CardContent>
          {course.questionSets.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No practice tests yet.{hasAnyProcessedChapterUploads && " Generate one from your chapters above."}
            </p>
          ) : (
            <div className="space-y-2">
              {course.questionSets.map((set) => (
                <Link
                  key={set.id}
                  href={`/courses/${courseId}/tests/${set.id}/attempt`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-medium">{set.name}</p>
                      <p className="text-xs text-gray-500">{set._count.questions} questions</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        Take Test
                      </Button>
                      <DeleteQuestionSet id={set.id} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
