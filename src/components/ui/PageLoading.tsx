export function PageLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
        aria-hidden="true"
      />
      <span className="sr-only">Caricamento…</span>
    </div>
  );
}
