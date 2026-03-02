import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const courseSchema = z.object({
  name: z.string().min(1, "Course name is required").max(100),
});

export const chapterSchema = z.object({
  courseId: z.string().min(1),
  name: z.string().min(1, "Chapter name is required").max(200),
});

export const generateFlashcardsSchema = z.object({
  courseId: z.string().min(1),
  chapterId: z.string().min(1),
  count: z.number().min(5).max(50).default(20),
});

export const generateQuestionsSchema = z.object({
  courseId: z.string().min(1),
  chapterIds: z.array(z.string().min(1)).min(1),
  count: z.number().min(5).max(30).default(15),
  questionTypes: z
    .array(z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]))
    .min(1),
  styleGuideUploadId: z.string().optional(),
});

export const submitTestSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      userAnswer: z.string(),
    })
  ),
});
