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
      uploads: { orderBy: { createdAt: "desc" } },
      flashcardSets: {
        include: { _count: { select: { cards: true } } },
        orderBy: { createdAt: "desc" },
      },
      questionSets: {
        include: { _count: { select: { questions: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!course) notFound();

  const processedUploads = course.uploads.filter(
    (u) => u.processingStatus === "COMPLETED" && u.contentType === "LECTURE_NOTES"
  );
  const examUploads = course.uploads.filter(
    (u) => u.processingStatus === "COMPLETED" && u.contentType === "PREVIOUS_EXAM"
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course.name}</h1>
          <p className="text-gray-500">{course.uploads.length} uploads</p>
        </div>
        <Link href={`/courses/${courseId}/upload`}>
          <Button>Upload Files</Button>
        </Link>
      </div>

      {/* Uploads */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Uploads</h2>
        </CardHeader>
        <CardContent>
          {course.uploads.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No files uploaded yet.{" "}
              <Link href={`/courses/${courseId}/upload`} className="text-blue-600 hover:underline">
                Upload some
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
                    <div>
                      <p className="text-sm font-medium">{upload.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {upload.contentType === "LECTURE_NOTES" ? "Lecture Notes" : "Previous Exam"}
                      </p>
                    </div>
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

      {/* Generate Section */}
      {processedUploads.length > 0 && (
        <GenerateOptions
          courseId={courseId}
          uploads={processedUploads.map((u) => ({ id: u.id, fileName: u.fileName }))}
          examUploads={examUploads.map((u) => ({ id: u.id, fileName: u.fileName }))}
        />
      )}

      {/* Flashcard Sets */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Flashcard Sets</h2>
        </CardHeader>
        <CardContent>
          {course.flashcardSets.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No flashcard sets yet. Generate some from your uploads above.
            </p>
          ) : (
            <div className="space-y-2">
              {course.flashcardSets.map((set) => (
                <Link
                  key={set.id}
                  href={`/courses/${courseId}/flashcards/${set.id}/study`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-medium">{set.name}</p>
                      <p className="text-xs text-gray-500">{set._count.cards} cards</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Study
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Sets */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Practice Tests</h2>
        </CardHeader>
        <CardContent>
          {course.questionSets.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No practice tests yet. Generate some from your uploads above.
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
                    <Button variant="ghost" size="sm">
                      Take Test
                    </Button>
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
