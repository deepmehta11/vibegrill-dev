import { notFound } from "next/navigation";
import { getWorkspaceTask } from "@/lib/tasks";
import { Workspace } from "@/app/workspace/workspace";

// Practice harness — try a task without an account or saved session.
export const dynamic = "force-dynamic";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const task = getWorkspaceTask(slug);
  if (!task) notFound();

  return <Workspace task={task} />;
}
