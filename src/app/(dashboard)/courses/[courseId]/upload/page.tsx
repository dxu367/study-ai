"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/uploads/file-upload-zone";
import { UploadList } from "@/components/uploads/upload-list";
import { ContentTypeSelector } from "@/components/uploads/content-type-selector";

export default function UploadPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const [contentType, setContentType] = useState<"LECTURE_NOTES" | "PREVIOUS_EXAM">("LECTURE_NOTES");
  const [uploads, setUploads] = useState<Array<{
    id: string;
    fileName: string;
    fileType: string;
    contentType: string;
    processingStatus: string;
    createdAt: string;
  }>>([]);

  const fetchUploads = useCallback(async () => {
    const res = await fetch(`/api/courses?_=${Date.now()}`);
    if (res.ok) {
      const courses = await res.json();
      const course = courses.find((c: { id: string }) => c.id === courseId);
      if (course?.uploads) {
        setUploads(course.uploads);
      }
    }
  }, [courseId]);

  useEffect(() => {
    // Fetch current uploads for this course
    const fetchCourseUploads = async () => {
      const res = await fetch(`/api/uploads?courseId=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setUploads(data);
      }
    };
    fetchCourseUploads();
  }, [courseId]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Upload Files</h1>
        <Button variant="secondary" onClick={() => router.push(`/courses/${courseId}`)}>
          Back to Course
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Content Type</h2>
          <p className="text-sm text-gray-500">
            Select what type of content you&apos;re uploading
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ContentTypeSelector value={contentType} onChange={setContentType} />
          <FileUploadZone
            courseId={courseId}
            contentType={contentType}
            onUploaded={fetchUploads}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Uploaded Files</h2>
        </CardHeader>
        <CardContent>
          <UploadList uploads={uploads} />
        </CardContent>
      </Card>
    </div>
  );
}
