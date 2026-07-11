export default async function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8">
      <h1 className="text-2xl font-semibold">Note editor</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Placeholder for <code>/notes/{id}</code> — TipTap editor, title field,
        share toggle, and delete button.
      </p>
    </main>
  );
}
