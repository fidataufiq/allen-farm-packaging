"use client";

import { useState } from "react";
import { hydroGreenhouses, organicGreenhouses } from "@/data/greenhouses";

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

  function toggleGreenhouse(greenhouse: string, type: "hydro" | "organic") {
    if (type === "hydro") {
      setSelectedHydro((current) => (current.includes(greenhouse) ? current.filter((item) => item !== greenhouse) : [...current, greenhouse]));
    } else {
      setSelectedOrganic((current) => (current.includes(greenhouse) ? current.filter((item) => item !== greenhouse) : [...current, greenhouse]));
    }

    setCopied(false);
  }

  const reportLines = [`Laporan Packaging Allen Farm ${formattedDate}`, selectedHydro.length > 0 ? `Panen Hidro ${selectedHydro.join(", ")}` : "", selectedOrganic.length > 0 ? `Panen Organik ${selectedOrganic.join(", ")}` : ""].filter(
    Boolean,
  );

  const report = reportLines.join("\n");

  async function copyReport() {
    if (!report) return;

    await navigator.clipboard.writeText(report);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  const totalSelected = selectedHydro.length + selectedOrganic.length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <header className="mb-8">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-emerald-600">Packaging Report</p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Allen Farm</h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">Pilih greenhouse yang dipanen untuk membuat laporan secara otomatis.</p>
        </header>

        {/* Date */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tanggal Laporan</p>

          <p className="mt-2 text-lg font-bold capitalize text-slate-900">{formattedDate}</p>
        </section>

        {/* Selection Summary */}
        <section className="mb-8 rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-900">Greenhouse Dipilih</p>

              <p className="mt-1 text-xs text-emerald-700">{totalSelected === 0 ? "Belum ada greenhouse dipilih" : `${totalSelected} greenhouse dipilih`}</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-emerald-700 shadow-sm">{totalSelected}</div>
          </div>
        </section>

        {/* Hydro */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">Hidro</h2>

            <p className="mt-1 text-sm text-slate-500">Pilih semua greenhouse hidro yang dipanen hari ini.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {hydroGreenhouses.map((greenhouse) => {
              const isSelected = selectedHydro.includes(greenhouse);

              return (
                <button
                  key={greenhouse}
                  type="button"
                  onClick={() => toggleGreenhouse(greenhouse, "hydro")}
                  aria-pressed={isSelected}
                  className={`rounded-xl px-3 py-4 text-sm font-bold transition active:scale-95 ${
                    isSelected ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {greenhouse}
                </button>
              );
            })}
          </div>
        </section>

        {/* Organic */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">Organik</h2>

            <p className="mt-1 text-sm text-slate-500">Pilih semua greenhouse organik yang dipanen hari ini.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {organicGreenhouses.map((greenhouse) => {
              const isSelected = selectedOrganic.includes(greenhouse);

              return (
                <button
                  key={greenhouse}
                  type="button"
                  onClick={() => toggleGreenhouse(greenhouse, "organic")}
                  aria-pressed={isSelected}
                  className={`rounded-xl px-3 py-4 text-sm font-bold transition active:scale-95 ${
                    isSelected ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {greenhouse}
                </button>
              );
            })}
          </div>
        </section>

        {/* Report Preview */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Preview Laporan</h2>

            <p className="mt-1 text-sm text-slate-500">Hasil yang akan dikirim ke grup WhatsApp.</p>
          </div>

          <div className="whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 ring-1 ring-slate-100">{report || "Belum ada greenhouse yang dipilih."}</div>
        </section>

        {/* Copy Button */}
        <button
          type="button"
          onClick={copyReport}
          disabled={totalSelected === 0}
          className="mb-8 w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-slate-200 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {copied ? "✓ Laporan Berhasil Disalin" : "📋 Copy Laporan"}
        </button>
      </div>
    </main>
  );
}
