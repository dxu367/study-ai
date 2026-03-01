import Link from "next/link";
import { redirect } from "next/navigation";

// Redirect /courses to /dashboard (courses are shown there)
export default function CoursesPage() {
  redirect("/dashboard");
}
