import GreenhouseButton from "./GreenhouseButton";

type GreenhouseSectionProps = {
  title: string;
  description: string;
  greenhouses: readonly string[];
  selected: string[];
  onToggle: (greenhouse: string) => void;
};

export default function GreenhouseSection({ title, description, greenhouses, selected, onToggle }: GreenhouseSectionProps) {
  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>

        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {greenhouses.map((greenhouse) => (
          <GreenhouseButton key={greenhouse} name={greenhouse} selected={selected.includes(greenhouse)} onClick={() => onToggle(greenhouse)} />
        ))}
      </div>
    </section>
  );
}
