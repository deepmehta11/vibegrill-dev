import { notFound, redirect } from "next/navigation";
import { currentUserId } from "@/lib/auth/server";
import { getSession, getMessages } from "@/lib/sessions";
import { getWorkspaceTask } from "@/lib/tasks";
import { Workspace } from "@/app/workspace/workspace";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const userId = await currentUserId();
  if (!userId) redirect("/auth/sign-in");

  const session = await getSession(sessionId, userId);
  if (!session) notFound();
  if (session.status === "submitted") redirect(`/report/${sessionId}`);

  const task = getWorkspaceTask(session.task_slug);
  if (!task) notFound();

  const messages = await getMessages(sessionId);

  return (
    <Workspace
      task={task}
      sessionId={sessionId}
      initialFiles={session.files}
      initialMessages={messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))}
    />
  );
}
