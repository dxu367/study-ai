import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/get-session";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GenerateFlashcards } from "./generate-flashcards";

export default async function ChapterDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = getUserId(session!);
  const { courseId, chapterId } = await params;

  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, courseId, course: { userId } },
    include: {
      uploads: { orderBy: { createdAt: "desc" } },
      flashcardSets: {
        include: { _count: { select: { cards: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!chapter) notFound();

  const processedUploads = chapter.uploads.filter(
    (u) => u.processingStatus === "COMPLETED" && u.contentType === "LECTURE_NOTES"
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/courses/${courseId}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Back to Course
          </Link>
          <h1 className="text-2xl font-bold mt-1">{chapter.name}</h1>
          <p className="text-gray-500">{chapter.uploads.length} notes</p>
        </div>
        <Link href={`/courses/${courseId}/chapters/${chapterId}/upload`}>
          <Button>Upload Notes</Button>
        </Link>
      </div>

      {/* Uploads */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Lecture Notes</h2>
        </CardHeader>
        <CardContent>
          {chapter.uploads.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No notes uploaded yet.{" "}
              <Link
                href={`/courses/${courseId}/chapters/${chapterId}/upload`}
                className="text-blue-600 hover:underline"
              >
                Upload some
              </Link>
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {chapter.uploads.map((upload) => (
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

      {/* Generate Flashcards */}
      {processedUploads.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Generate Study Materials</h2>
          </CardHeader>
          <CardContent>
            <GenerateFlashcards courseId={courseId} chapterId={chapterId} />
          </CardContent>
        </Card>
      )}

      {/* Flashcard Sets */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Flashcard Sets</h2>
        </CardHeader>
        <CardContent>
          {chapter.flashcardSets.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No flashcard sets yet.{processedUploads.length > 0 && " Generate some from your notes above."}
            </p>
          ) : (
            <div className="space-y-2">
              {chapter.flashcardSets.map((set) => (
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
    </div>
  );
}
