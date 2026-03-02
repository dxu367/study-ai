"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/uploads/file-upload-zone";
import { UploadList } from "@/components/uploads/upload-list";

export default function UploadPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const [uploads, setUploads] = useState<Array<{
    id: string;
    fileName: string;
    fileType: string;
    contentType: string;
    processingStatus: string;
    createdAt: string;
  }>>([]);

  const fetchUploads = useCallback(async () => {
    const res = await fetch(`/api/uploads?courseId=${courseId}`);
    if (res.ok) {
      const data = await res.json();
      setUploads(data.filter((u: { contentType: string }) => u.contentType === "PREVIOUS_EXAM"));
    }
  }, [courseId]);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Upload Previous Exam</h1>
        <Button variant="secondary" onClick={() => router.push(`/courses/${courseId}`)}>
          Back to Course
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Upload Exam File</h2>
          <p className="text-sm text-gray-500">
            Upload a previous exam to use as a style guide for practice test generation
          </p>
        </CardHeader>
        <CardContent>
          <FileUploadZone
            courseId={courseId}
            contentType="PREVIOUS_EXAM"
            onUploaded={fetchUploads}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Uploaded Exams</h2>
        </CardHeader>
        <CardContent>
          <UploadList uploads={uploads} />
        </CardContent>
      </Card>
    </div>
  );
}
