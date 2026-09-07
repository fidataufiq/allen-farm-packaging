"use client";

import { useState } from "react";
import { hydroGreenhouses, organicGreenhouses } from "@/data/greenhouses";

function getLocalDateString() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function groupBySector(greenhouses: readonly string[]) {
  return greenhouses.reduce<Record<string, string[]>>((groups, greenhouse) => {
    const sector = greenhouse.match(/^[A-Za-z]+/)?.[0] ?? "";

    if (!groups[sector]) {
      groups[sector] = [];
    }

    groups[sector].push(greenhouse);

    return groups;
  }, {});
}

export default function ExperimentPage() {
  const [selectedHydro, setSelectedHydro] = useState<string[]>([]);
  const [selectedOrganic, setSelectedOrganic] = useState<string[]>([]);

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  const [openHydroSectors, setOpenHydroSectors] = useState<string[]>(["A"]);

  const [openOrganicSectors, setOpenOrganicSectors] = useState<string[]>(["O"]);

  const [copied, setCopied] = useState(false);

  const hydroSectors = groupBySector(hydroGreenhouses);
  const organicSectors = groupBySector(organicGreenhouses);

  const totalHydro = selectedHydro.length;
  const totalOrganic = selectedOrganic.length;
  const totalSelected = totalHydro + totalOrganic;

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
    .format(new Date(`${selectedDate}T00:00:00`))
    .replace(",", "");

  function toggleGreenhouse(greenhouse: string, type: "hydro" | "organic") {
    if (type === "hydro") {
      setSelectedHydro((current) => (current.includes(greenhouse) ? current.filter((item) => item !== greenhouse) : [...current, greenhouse]));
    } else {
      setSelectedOrganic((current) => (current.includes(greenhouse) ? current.filter((item) => item !== greenhouse) : [...current, greenhouse]));
    }

    setCopied(false);
  }

  function toggleSector(sector: string, type: "hydro" | "organic") {
    if (type === "hydro") {
      setOpenHydroSectors((current) => (current.includes(sector) ? current.filter((item) => item !== sector) : [...current, sector]));
    } else {
      setOpenOrganicSectors((current) => (current.includes(sector) ? current.filter((item) => item !== sector) : [...current, sector]));
    }
  }

  function clearAll() {
    setSelectedHydro([]);
    setSelectedOrganic([]);
    setCopied(false);
  }

  function removeGreenhouse(greenhouse: string, type: "hydro" | "organic") {
    if (type === "hydro") {
      setSelectedHydro((current) => current.filter((item) => item !== greenhouse));
    } else {
      setSelectedOrganic((current) => current.filter((item) => item !== greenhouse));
    }

    setCopied(false);
  }

  function selectEntireSector(sector: string, type: "hydro" | "organic") {
    const sectorGreenhouses = type === "hydro" ? hydroSectors[sector] : organicSectors[sector];

    if (!sectorGreenhouses) return;

    if (type === "hydro") {
      setSelectedHydro((current) => {
        const allSelected = sectorGreenhouses.every((item) => current.includes(item));

        if (allSelected) {
          return current.filter((item) => !sectorGreenhouses.includes(item));
        }

        return Array.from(new Set([...current, ...sectorGreenhouses]));
      });
    } else {
      setSelectedOrganic((current) => {
        const allSelected = sectorGreenhouses.every((item) => current.includes(item));

        if (allSelected) {
          return current.filter((item) => !sectorGreenhouses.includes(item));
        }

        return Array.from(new Set([...current, ...sectorGreenhouses]));
      });
    }

    setCopied(false);
  }

  function scrollToPreview() {
    document.getElementById("report-preview")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const sortedHydro = [...selectedHydro].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const sortedOrganic = [...selectedOrganic].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const report = [`Laporan Packaging Allen Farm ${formattedDate}`, sortedHydro.length > 0 ? `Panen Hidro ${sortedHydro.join(", ")}` : "", sortedOrganic.length > 0 ? `Panen Organik ${sortedOrganic.join(", ")}` : ""]
    .filter(Boolean)
    .join("\n");

  async function copyReport() {
    if (totalSelected === 0) return;

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

  function renderSector(sector: string, greenhouses: string[], type: "hydro" | "organic", isOpen: boolean) {
    const selected = type === "hydro" ? selectedHydro : selectedOrganic;

    const selectedInSector = greenhouses.filter((item) => selected.includes(item)).length;

    const allSelected = greenhouses.length > 0 && selectedInSector === greenhouses.length;

    const progress = greenhouses.length > 0 ? (selectedInSector / greenhouses.length) * 100 : 0;

    const accent =
      type === "hydro"
        ? {
            soft: "bg-emerald-50",
            text: "text-emerald-700",
            bar: "bg-emerald-500",
            selected: "bg-emerald-600",
            ring: "ring-emerald-500",
          }
        : {
            soft: "bg-amber-50",
            text: "text-amber-700",
            bar: "bg-amber-500",
            selected: "bg-amber-500",
            ring: "ring-amber-500",
          };

    return (
      <div key={sector} className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200 transition">
        {/* Sector Header */}
        <button type="button" onClick={() => toggleSector(sector, type)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50 active:bg-slate-100">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent.soft} text-lg font-black ${accent.text}`}>{sector}</div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-black text-slate-900">Sektor {sector}</p>

              {selectedInSector > 0 && <span className={`rounded-full ${accent.soft} px-2 py-0.5 text-[10px] font-black ${accent.text}`}>Aktif</span>}
            </div>

            <div className="mt-1 flex items-center gap-2">
              <p className="shrink-0 text-xs text-slate-400">
                {selectedInSector} dari {greenhouses.length}
              </p>

              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${accent.bar} transition-all duration-300`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-400">{isOpen ? "−" : "+"}</div>
        </button>

        {/* Sector Content */}
        {isOpen && (
          <div className="border-t border-slate-100 px-4 pb-4 pt-3">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-700">Pilih greenhouse</p>

                <p className="mt-0.5 text-[11px] text-slate-400">Tap nomor yang dipanen hari ini.</p>
              </div>

              <button
                type="button"
                onClick={() => selectEntireSector(sector, type)}
                className={`shrink-0 rounded-xl px-3 py-2 text-[11px] font-black transition active:scale-95 ${allSelected ? "bg-slate-100 text-slate-600" : `${accent.soft} ${accent.text}`}`}
              >
                {allSelected ? "Kosongkan" : "Pilih Semua"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {greenhouses.map((greenhouse) => {
                const isSelected = selected.includes(greenhouse);

                return (
                  <button
                    key={greenhouse}
                    type="button"
                    onClick={() => toggleGreenhouse(greenhouse, type)}
                    aria-pressed={isSelected}
                    className={`relative min-h-[58px] rounded-2xl px-3 py-3 text-sm font-black transition active:scale-95 ${
                      isSelected ? `${accent.selected} text-white shadow-md ring-2 ${accent.ring} ring-offset-2` : "bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-black text-slate-700">✓</span>}

                    <span className="block pt-0.5">{greenhouse}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] pb-40 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white shadow-sm">AF</div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 sm:text-xs">Allen Farm</p>

                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-purple-600">Eksperimen</span>
                </div>

                <h1 className="mt-0.5 truncate text-base font-black sm:text-xl">Packaging Report</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {totalSelected > 0 && (
                <button type="button" onClick={clearAll} className="shrink-0 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 transition active:scale-95 hover:bg-red-100">
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Hero */}
        <section className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">Laporan Packaging</p>

          <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Pilih greenhouse yang dipanen</h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">Tandai greenhouse yang dipanen hari ini. Laporan akan dibuat otomatis dan siap dikirim ke WhatsApp.</p>
        </section>

        {/* Date */}
        <section className="mb-5 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Tanggal panen</p>

              <p className="mt-1.5 text-base font-black capitalize text-slate-900">{formattedDate}</p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-lg">📅</div>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setCopied(false);
              }}
              className="min-w-0 flex-1 rounded-2xl border-0 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="button"
              onClick={() => {
                setSelectedDate(getLocalDateString());
                setCopied(false);
              }}
              className="rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-700 transition active:scale-95"
            >
              Hari Ini
            </button>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-7 overflow-hidden rounded-[1.5rem] bg-slate-900 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Pilihan hari ini</p>

              <p className="mt-1 text-sm text-slate-300">{totalSelected === 0 ? "Belum ada greenhouse yang dipilih" : `${totalSelected} greenhouse akan masuk laporan`}</p>
            </div>

            <div className="flex h-14 min-w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 px-3 text-xl font-black shadow-lg">{totalSelected}</div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hidro</p>

              <p className="mt-1 text-lg font-black">{totalHydro}</p>

              <p className="text-[11px] text-slate-400">greenhouse</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organik</p>

              <p className="mt-1 text-lg font-black">{totalOrganic}</p>

              <p className="text-[11px] text-slate-400">greenhouse</p>
            </div>
          </div>

          {/* Selected Greenhouses */}
          {totalSelected > 0 && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[11px] font-bold text-slate-400">Greenhouse dipilih</p>

                <button type="button" onClick={scrollToPreview} className="text-[11px] font-black text-emerald-400 transition hover:text-emerald-300">
                  Lihat Preview →
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {sortedHydro.map((greenhouse) => (
                  <button
                    key={`hydro-${greenhouse}`}
                    type="button"
                    onClick={() => removeGreenhouse(greenhouse, "hydro")}
                    title={`Hapus ${greenhouse}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-black text-emerald-300 transition active:scale-95 hover:bg-emerald-500/30"
                  >
                    H {greenhouse}
                    <span className="text-emerald-400">×</span>
                  </button>
                ))}

                {sortedOrganic.map((greenhouse) => (
                  <button
                    key={`organic-${greenhouse}`}
                    type="button"
                    onClick={() => removeGreenhouse(greenhouse, "organic")}
                    title={`Hapus ${greenhouse}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-500/20 px-3 py-2 text-xs font-black text-amber-300 transition active:scale-95 hover:bg-amber-500/30"
                  >
                    O {greenhouse}
                    <span className="text-amber-400">×</span>
                  </button>
                ))}
              </div>

              <p className="mt-2 text-[10px] text-slate-500">Tap item untuk menghapusnya dari laporan.</p>
            </div>
          )}
        </section>

        {/* Hydro */}
        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-600">Hidroponik</p>

              <h3 className="mt-1 text-xl font-black">Green House Hidro</h3>

              <p className="mt-1 text-sm text-slate-500">Pilih sektor, lalu tandai greenhouse yang dipanen.</p>
            </div>

            <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">{totalHydro} dipilih</span>
          </div>

          <div className="space-y-3">{Object.entries(hydroSectors).map(([sector, greenhouses]) => renderSector(sector, greenhouses, "hydro", openHydroSectors.includes(sector)))}</div>
        </section>

        {/* Organic */}
        <section className="mb-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-600">Area 02</p>

              <h3 className="mt-1 text-xl font-black">Green House Organik</h3>

              <p className="mt-1 text-sm text-slate-500">Pilih sektor dan greenhouse yang dipanen.</p>
            </div>

            <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700">{totalOrganic} dipilih</span>
          </div>

          <div className="space-y-3">{Object.entries(organicSectors).map(([sector, greenhouses]) => renderSector(sector, greenhouses, "organic", openOrganicSectors.includes(sector)))}</div>
        </section>

        {/* Preview */}
        <section id="report-preview" className="mb-6 scroll-mt-5 overflow-hidden rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600">Langkah terakhir</p>

            <h3 className="mt-1 text-lg font-black">Preview laporan</h3>

            <p className="mt-1 text-xs text-slate-400">Pastikan pilihan sudah sesuai sebelum disalin.</p>
          </div>

          <div className="bg-[#eef2f5] p-4 sm:p-5">
            <div className="ml-auto max-w-[92%] rounded-2xl rounded-tr-md bg-white p-4 shadow-sm">
              {totalSelected > 0 ? (
                <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{report}</p>
              ) : (
                <div className="py-3 text-center">
                  <p className="text-sm font-bold text-slate-500">Belum ada pilihan</p>

                  <p className="mt-1 text-xs text-slate-400">Pilih greenhouse untuk membuat laporan.</p>
                </div>
              )}

              <p className="mt-3 text-right text-[10px] text-slate-300">siap dikirim</p>
            </div>
          </div>
        </section>

        {/* Desktop Copy */}
        <section className="hidden rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:block">
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="text-sm font-black text-slate-900">Laporan sudah sesuai?</p>

              <p className="mt-1 text-xs leading-5 text-slate-500">Salin laporan, lalu paste langsung ke grup WhatsApp packaging.</p>
            </div>

            <button
              type="button"
              onClick={copyReport}
              disabled={totalSelected === 0}
              className={`shrink-0 rounded-2xl px-6 py-4 text-sm font-black transition active:scale-95 ${
                copied ? "bg-emerald-100 text-emerald-700" : totalSelected > 0 ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700" : "cursor-not-allowed bg-slate-100 text-slate-400"
              }`}
            >
              {copied ? "✓ Berhasil Disalin" : "Salin Laporan"}
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 pb-4 text-center">
          <p className="text-xs font-bold text-slate-400">Allen Farm Packaging</p>

          <p className="mt-1 text-[10px] text-slate-300">Packaging Report System</p>
        </footer>
      </div>

      {/* Mobile Sticky Action */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:hidden">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2.5 flex items-center justify-between gap-3 px-1">
            <div className="min-w-0">
              <p className="text-xs font-black text-slate-900">{totalSelected === 0 ? "Belum ada pilihan" : `${totalSelected} greenhouse dipilih`}</p>

              <p className="mt-0.5 truncate text-[11px] text-slate-400">{copied ? "Laporan sudah disalin." : totalSelected > 0 ? "Siap dikirim ke WhatsApp." : "Pilih greenhouse terlebih dahulu."}</p>
            </div>

            {totalSelected > 0 && (
              <div className="flex shrink-0 gap-1.5">
                {totalHydro > 0 && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">H {totalHydro}</span>}

                {totalOrganic > 0 && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">O {totalOrganic}</span>}
              </div>
            )}
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
