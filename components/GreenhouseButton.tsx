type GreenhouseButtonProps = {
  name: string;
  selected: boolean;
  onClick: () => void;
};

export default function GreenhouseButton({ name, selected, onClick }: GreenhouseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative min-h-14 rounded-2xl px-3 py-4 text-sm font-bold transition-all duration-200 active:scale-95 ${
        selected ? "bg-emerald-600 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-600 ring-offset-2" : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300"
      }`}
    >
      {selected && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-black text-emerald-600">✓</span>}

      {name}
    </button>
  );
}
