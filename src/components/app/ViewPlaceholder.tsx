export function ViewPlaceholder({ title, plan }: { title: string; plan: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-sans text-xl font-medium text-text">{title}</p>
      <p className="mt-2 text-sm text-muted">{plan}</p>
    </div>
  );
}
