import { currentUserId } from "@/lib/auth/server";
import { updateSessionFiles } from "@/lib/sessions";

// Debounced autosave of workspace file state.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await currentUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let body: { files?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.files || typeof body.files !== "object") {
    return Response.json({ error: "Missing files" }, { status: 400 });
  }
  const ok = await updateSessionFiles(id, userId, body.files);
  if (!ok) {
    return Response.json({ error: "Not found or not editable" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
