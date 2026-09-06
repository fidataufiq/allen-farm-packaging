"use client";

import { useState } from "react";
import { hydroGreenhouses, organicGreenhouses } from "@/data/greenhouses";
import GreenhouseSection from "@/components/GreenhouseSection";
import ReportPreview from "@/components/ReportPreview";

export default function Home() {
  const [selectedHydro, setSelectedHydro] = useState<string[]>([]);
  const [selectedOrganic, setSelectedOrganic] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const today = new Date();

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(today);

  function toggleItem(greenhouse: string, type: "hydro" | "organic") {
    if (type === "hydro") {
      setSelectedHydro((current) => (current.includes(greenhouse) ? current.filter((item) => item !== greenhouse) : [...current, greenhouse]));
    } else {
      setSelectedOrganic((current) => (current.includes(greenhouse) ? current.filter((item) => item !== greenhouse) : [...current, greenhouse]));
    }

    setCopied(false);
  }

  function clearAll() {
    setSelectedHydro([]);
    setSelectedOrganic([]);
    setCopied(false);
  }

  const totalSelected = selectedHydro.length + selectedOrganic.length;

  const report = [`Laporan Packaging Allen Farm ${formattedDate}`, selectedHydro.length > 0 ? `Panen Hidro ${selectedHydro.join(", ")}` : "", selectedOrganic.length > 0 ? `Panen Organik ${selectedOrganic.join(", ")}` : ""]
    .filter(Boolean)
    .join("\n");

  async function copyReport() {
    if (!report) return;

    await navigator.clipboard.writeText(report);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <header className="mb-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-black text-white shadow-md shadow-emerald-200">AF</div>

              <div>
                <p className="text-sm font-bold text-slate-900">Allen Farm</p>

                <p className="text-xs text-slate-500">Packaging Team</p>
              </div>
            </div>

            {totalSelected > 0 && (
              <button type="button" onClick={clearAll} className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-red-500">
                Hapus Semua
              </button>
            )}
          </div>

          <div>
            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-emerald-600">Packaging Report</p>

            <h1 className="text-3xl font-black tracking-tight text-slate-900">Laporan Panen</h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">Pilih greenhouse yang dipanen hari ini. Laporan WhatsApp akan dibuat otomatis.</p>
          </div>
        </header>

        {/* Date */}
        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tanggal Laporan</p>

              <p className="mt-2 text-lg font-bold capitalize text-slate-900">{formattedDate}</p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl">📅</div>
          </div>
        </section>

        {/* Selection Summary */}
        <section className="mb-8 rounded-3xl bg-emerald-600 p-5 text-white shadow-lg shadow-emerald-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold">Greenhouse Dipilih</p>

              <p className="mt-1 text-xs text-emerald-100">{totalSelected === 0 ? "Silakan pilih lokasi panen" : `${totalSelected} lokasi siap dilaporkan`}</p>
            </div>

            <div className="flex h-12 min-w-12 items-center justify-center rounded-2xl bg-white text-lg font-black text-emerald-600">{totalSelected}</div>
          </div>
        </section>

        {/* Hydro */}
        <GreenhouseSection title="Hidro" description="Pilih greenhouse hidro yang dipanen." greenhouses={hydroGreenhouses} selected={selectedHydro} onToggle={(greenhouse) => toggleItem(greenhouse, "hydro")} />

        {/* Organic */}
        <GreenhouseSection title="Organik" description="Pilih greenhouse organik yang dipanen." greenhouses={organicGreenhouses} selected={selectedOrganic} onToggle={(greenhouse) => toggleItem(greenhouse, "organic")} />

        {/* Preview */}
        <ReportPreview report={report} />

        {/* Copy */}
        <button
          type="button"
          onClick={copyReport}
          disabled={totalSelected === 0}
          className={`mb-8 w-full rounded-2xl px-5 py-4 text-sm font-bold transition-all active:scale-[0.98] ${
            copied ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : totalSelected > 0 ? "bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-slate-800" : "cursor-not-allowed bg-slate-200 text-slate-400"
          }`}
        >
          {copied ? "✓ Laporan Berhasil Disalin" : "📋 Copy Laporan"}
        </button>

        <p className="pb-4 text-center text-xs text-slate-400">Allen Farm · Packaging Report</p>
      </div>
    </main>
  );
}
