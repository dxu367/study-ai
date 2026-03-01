"use client";

import { Badge } from "@/components/ui/badge";

interface Upload {
  id: string;
  fileName: string;
  fileType: string;
  contentType: string;
  processingStatus: string;
  createdAt: string;
}

const statusVariant: Record<string, "default" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  PROCESSING: "warning",
  COMPLETED: "success",
  FAILED: "error",
};

export function UploadList({ uploads }: { uploads: Upload[] }) {
  if (uploads.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        No files uploaded yet. Upload lecture notes or a previous exam to get started.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {uploads.map((upload) => (
        <div key={upload.id} className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
              {upload.fileType === "PDF" ? "PDF" : upload.fileType === "IMAGE" ? "IMG" : "TXT"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{upload.fileName}</p>
              <p className="text-xs text-gray-500">
                {upload.contentType === "LECTURE_NOTES" ? "Lecture Notes" : "Previous Exam"}
              </p>
            </div>
          </div>
          <Badge variant={statusVariant[upload.processingStatus] || "default"}>
            {upload.processingStatus.toLowerCase()}
          </Badge>
        </div>
      ))}
    </div>
  );
}
