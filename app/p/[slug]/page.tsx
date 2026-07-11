export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-8">
      <h1 className="text-2xl font-semibold">Public note</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Placeholder for <code>/p/{slug}</code> — read-only public view of a
        shared note.
      </p>
    </main>
  );
}
