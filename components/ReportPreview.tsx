type ReportPreviewProps = {
  report: string;
};

export default function ReportPreview({ report }: ReportPreviewProps) {
  return (
    <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Preview</p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">Laporan Hari Ini</h2>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">WhatsApp</span>
      </div>

      <div className="whitespace-pre-line rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 ring-1 ring-slate-100">{report || "Belum ada greenhouse yang dipilih."}</div>
    </section>
  );
}
