"use server";

import { redirect } from "next/navigation";
import { currentUserId } from "@/lib/auth/server";
import { createSession } from "@/lib/sessions";
import { taskExists } from "@/lib/tasks";

export async function startSession(formData: FormData) {
  const slug = String(formData.get("task") || "");
  const userId = await currentUserId();
  if (!userId) redirect("/auth/sign-in");
  if (!taskExists(slug)) redirect("/tasks");
  const id = await createSession(userId, slug);
  redirect(`/workspace/${id}`);
}
