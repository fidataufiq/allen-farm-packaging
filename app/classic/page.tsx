"use client";

import { useState } from "react";
import { hydroGreenhouses, organicGreenhouses } from "@/data/greenhouses";
import GreenhouseSection from "@/components/GreenhouseSection";
import ReportPreview from "@/components/ReportPreview";

function getLocalDateString() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Home() {
  const [selectedHydro, setSelectedHydro] = useState<string[]>([]);
  const [selectedOrganic, setSelectedOrganic] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [copied, setCopied] = useState(false);

  const totalSelected = selectedHydro.length + selectedOrganic.length;

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
    .format(new Date(`${selectedDate}T00:00:00`))
    .replace(",", "");

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

  // Urutkan greenhouse berdasarkan huruf lalu nomor.
  // Contoh: A5, A7, B5, C1
  const sortedHydro = [...selectedHydro].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const sortedOrganic = [...selectedOrganic].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const report = [`Laporan Packaging Allen Farm ${formattedDate}`, sortedHydro.length > 0 ? `Panen Hidro ${sortedHydro.join(", ")}` : "", sortedOrganic.length > 0 ? `Panen Organik ${sortedOrganic.join(", ")}` : ""]
    .filter(Boolean)
    .join("\n");

  async function copyReport() {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(report);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert("Laporan gagal disalin. Silakan coba lagi.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-36 text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-black text-white shadow-sm sm:h-12 sm:w-12">AF</div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600 sm:text-xs">Allen Farm</p>

                <h1 className="truncate text-base font-black tracking-tight text-slate-900 sm:text-xl">Packaging Report</h1>
              </div>
            </div>

            {totalSelected > 0 && (
              <button type="button" onClick={clearAll} className="shrink-0 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 transition active:scale-95 hover:bg-red-100">
                Hapus Semua
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {/* INTRO */}
        <section className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Packaging Team</p>

          <div className="mt-1 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Laporan Panen</h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">Pilih greenhouse yang dipanen. Laporan otomatis siap disalin ke WhatsApp.</p>
            </div>

            {totalSelected > 0 && (
              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-3xl font-black text-emerald-600">{totalSelected}</p>
                <p className="text-xs font-semibold text-slate-400">dipilih</p>
              </div>
            )}
          </div>
        </section>

        {/* DATE */}
        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tanggal Laporan</p>

              <p className="mt-1 text-sm leading-5 text-slate-500">Pilih tanggal panen.</p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl">📅</div>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) => {
              setSelectedDate(event.target.value);
              setCopied(false);
            }}
            className="w-full rounded-2xl border-0 bg-slate-50 px-4 py-4 text-base font-bold text-slate-900 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-500"
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm font-bold capitalize text-emerald-700">{formattedDate}</p>

            <button
              type="button"
              onClick={() => {
                setSelectedDate(getLocalDateString());
                setCopied(false);
              }}
              className="shrink-0 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition active:scale-95 hover:bg-emerald-100"
            >
              Hari Ini
            </button>
          </div>
        </section>

        {/* MOBILE SELECTION SUMMARY */}
        <section className="mb-8 rounded-3xl bg-slate-900 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Greenhouse Dipilih</p>

              <p className="mt-1 text-sm text-slate-300">{totalSelected === 0 ? "Belum ada greenhouse dipilih" : `${totalSelected} greenhouse siap dilaporkan`}</p>
            </div>

            <div className="flex h-14 min-w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 px-3 text-xl font-black shadow-sm">{totalSelected}</div>
          </div>

          {totalSelected > 0 && (
            <div className="mt-4 border-t border-slate-700 pt-4">
              <div className="flex flex-wrap gap-2">
                {sortedHydro.map((greenhouse) => (
                  <span key={`hydro-${greenhouse}`} className="rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300">
                    Hidro {greenhouse}
                  </span>
                ))}

                {sortedOrganic.map((greenhouse) => (
                  <span key={`organic-${greenhouse}`} className="rounded-full bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-300">
                    Organik {greenhouse}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* HYDRO */}
        <GreenhouseSection title="Green House Hidro" description="Pilih semua greenhouse hidro yang dipanen." greenhouses={hydroGreenhouses} selected={selectedHydro} onToggle={(greenhouse) => toggleItem(greenhouse, "hydro")} />

        {/* ORGANIC */}
        <GreenhouseSection title="Green House Organik" description="Pilih semua greenhouse organik yang dipanen." greenhouses={organicGreenhouses} selected={selectedOrganic} onToggle={(greenhouse) => toggleItem(greenhouse, "organic")} />

        {/* PREVIEW */}
        <div className="mt-2">
          <ReportPreview report={report} />
        </div>

        {/* DESKTOP ACTION */}
        <section className="hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:block">
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="text-sm font-bold text-slate-900">Laporan sudah sesuai?</p>

              <p className="mt-1 text-xs leading-5 text-slate-500">Salin laporan lalu paste ke grup WhatsApp.</p>
            </div>

            <button
              type="button"
              onClick={copyReport}
              disabled={totalSelected === 0}
              className={`shrink-0 rounded-2xl px-6 py-4 text-sm font-black transition active:scale-95 ${
                copied ? "bg-emerald-100 text-emerald-700" : totalSelected > 0 ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700" : "cursor-not-allowed bg-slate-100 text-slate-400"
              }`}
            >
              {copied ? "✓ Laporan Berhasil Disalin" : "Salin Laporan"}
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-10 pb-4 text-center">
          <p className="text-xs font-medium text-slate-400">Allen Farm Packaging</p>

          <p className="mt-1 text-[11px] text-slate-300">Internal Reporting System</p>
        </footer>
      </div>

      {/* MOBILE STICKY ACTION */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900">{totalSelected === 0 ? "Belum ada pilihan" : `${totalSelected} greenhouse dipilih`}</p>

              <p className="truncate text-[11px] text-slate-400">{copied ? "Laporan sudah disalin." : "Siap dikirim ke WhatsApp."}</p>
            </div>

            {totalSelected > 0 && <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Siap</span>}
          </div>

          <button
            type="button"
            onClick={copyReport}
            disabled={totalSelected === 0}
            className={`w-full rounded-2xl px-5 py-4 text-base font-black transition active:scale-[0.98] ${
              copied ? "bg-emerald-100 text-emerald-700" : totalSelected > 0 ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "cursor-not-allowed bg-slate-200 text-slate-400"
            }`}
          >
            {copied ? "✓ Laporan Berhasil Disalin" : totalSelected > 0 ? "Salin Laporan" : "Pilih Greenhouse Terlebih Dahulu"}
          </button>
        </div>
      </div>
    </main>
  );
}
