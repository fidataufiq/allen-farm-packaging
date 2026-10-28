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
    if (!groups[sector]) groups[sector] = [];
    groups[sector].push(greenhouse);
    return groups;
  }, {});
}

type GreenhouseType = "hydro" | "organic";

export default function ExperimentPage() {
  const [selectedHydro, setSelectedHydro] = useState<string[]>([]);
  const [selectedOrganic, setSelectedOrganic] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [openHydroSectors, setOpenHydroSectors] = useState<string[]>(["A"]);
  const [openOrganicSectors, setOpenOrganicSectors] = useState<string[]>(["O"]);
  const [activeCategory, setActiveCategory] = useState<GreenhouseType>("hydro");
  const [copied, setCopied] = useState(false);

  const hydroSectors = groupBySector(hydroGreenhouses);
  const organicSectors = groupBySector(organicGreenhouses);
  const totalHydro = selectedHydro.length;
  const totalOrganic = selectedOrganic.length;
  const totalSelected = totalHydro + totalOrganic;
  const activeSectors = activeCategory === "hydro" ? hydroSectors : organicSectors;
  const activeOpenSectors = activeCategory === "hydro" ? openHydroSectors : openOrganicSectors;
  const activeSelected = activeCategory === "hydro" ? selectedHydro : selectedOrganic;

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
    .format(new Date(`${selectedDate}T00:00:00`))
    .replace(",", "");

  const sortedHydro = [...selectedHydro].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const sortedOrganic = [...selectedOrganic].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const report = [`Laporan Packaging Allen Farm ${formattedDate}`, sortedHydro.length > 0 ? `Panen Hidro ${sortedHydro.join(", ")}` : "", sortedOrganic.length > 0 ? `Panen Organik ${sortedOrganic.join(", ")}` : ""]
    .filter(Boolean)
    .join("\n");

  function toggleGreenhouse(greenhouse: string, type: GreenhouseType) {
    if (type === "hydro") {
      setSelectedHydro((current) => (current.includes(greenhouse) ? current.filter((item) => item !== greenhouse) : [...current, greenhouse]));
    } else {
      setSelectedOrganic((current) => (current.includes(greenhouse) ? current.filter((item) => item !== greenhouse) : [...current, greenhouse]));
    }
    setCopied(false);
  }

  function toggleSector(sector: string, type: GreenhouseType) {
    const setter = type === "hydro" ? setOpenHydroSectors : setOpenOrganicSectors;
    setter((current) => (current.includes(sector) ? current.filter((item) => item !== sector) : [...current, sector]));
  }

  function setAllSectorsOpen(open: boolean) {
    const sectorNames = Object.keys(activeSectors);
    const setter = activeCategory === "hydro" ? setOpenHydroSectors : setOpenOrganicSectors;
    setter(open ? sectorNames : []);
  }

  function clearAll() {
    setSelectedHydro([]);
    setSelectedOrganic([]);
    setCopied(false);
  }

  function removeGreenhouse(greenhouse: string, type: GreenhouseType) {
    if (type === "hydro") {
      setSelectedHydro((current) => current.filter((item) => item !== greenhouse));
    } else {
      setSelectedOrganic((current) => current.filter((item) => item !== greenhouse));
    }
    setCopied(false);
  }

  function selectEntireSector(sector: string, type: GreenhouseType) {
    const sectorGreenhouses = type === "hydro" ? hydroSectors[sector] : organicSectors[sector];
    if (!sectorGreenhouses) return;

    if (type === "hydro") {
      setSelectedHydro((current) => {
        const allSelected = sectorGreenhouses.every((item) => current.includes(item));
        return allSelected ? current.filter((item) => !sectorGreenhouses.includes(item)) : Array.from(new Set([...current, ...sectorGreenhouses]));
      });
    } else {
      setSelectedOrganic((current) => {
        const allSelected = sectorGreenhouses.every((item) => current.includes(item));
        return allSelected ? current.filter((item) => !sectorGreenhouses.includes(item)) : Array.from(new Set([...current, ...sectorGreenhouses]));
      });
    }
    setCopied(false);
  }

  function scrollToPreview() {
    document.getElementById("report-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function copyReport() {
    if (totalSelected === 0) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.alert("Laporan gagal disalin. Silakan coba lagi.");
    }
  }

  function renderSector(sector: string, greenhouses: string[], type: GreenhouseType, isOpen: boolean) {
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
      <div key={`${type}-${sector}`} className="overflow-hidden rounded-[24px] border border-white/90 bg-white/75 shadow-[0_12px_35px_rgba(35,66,43,0.07)] ring-1 ring-[#DCE8DC]/70 backdrop-blur-xl">
        <button type="button" onClick={() => toggleSector(sector, type)} aria-expanded={isOpen} className="flex min-h-[66px] w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-white/80 active:bg-[#F0F6EF] sm:px-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-black ${accent.soft} ${accent.text}`}>{sector}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-extrabold text-[#24372A]">Sektor {sector}</p>
              {selectedInSector > 0 && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${accent.soft} ${accent.text}`}>Aktif</span>}
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <p className="shrink-0 text-[11px] text-slate-500">
                {selectedInSector}/{greenhouses.length} dipilih
              </p>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full transition-all duration-300 ${accent.bar}`} style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F5F0] text-lg font-semibold text-[#68806E]">{isOpen ? "−" : "+"}</span>
        </button>

        {isOpen && (
          <div className="border-t border-[#EEF2EC] bg-gradient-to-b from-white/80 to-[#F5F8F3]/90 px-3 pb-4 pt-3 sm:px-4 sm:pb-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-[#718174]">Pilih lokasi yang dipanen</p>
              <button
                type="button"
                onClick={() => selectEntireSector(sector, type)}
                className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-extrabold transition active:scale-95 ${allSelected ? "bg-slate-100 text-slate-600" : `${accent.soft} ${accent.text}`}`}
              >
                {allSelected ? "Kosongkan sektor" : "Pilih semua"}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {greenhouses.map((greenhouse) => {
                const isSelected = selected.includes(greenhouse);
                return (
                  <button
                    key={greenhouse}
                    type="button"
                    onClick={() => toggleGreenhouse(greenhouse, type)}
                    aria-pressed={isSelected}
                    className={`flex min-h-11 items-center justify-center rounded-[12px] px-1.5 py-2.5 text-xs font-extrabold transition duration-200 active:scale-[0.97] ${
                      isSelected ? `${accent.selected} text-white shadow-sm ring-1 ${accent.ring}` : "bg-white text-[#405347] ring-1 ring-[#E1E9E0] hover:bg-[#F2F7F1]"
                    }`}
                  >
                    {greenhouse}
                    {isSelected && <span className="ml-1 text-[10px]">✓</span>}
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
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_rgba(194,226,202,0.52),_transparent_34%),radial-gradient(ellipse_at_top_right,_rgba(229,211,164,0.28),_transparent_30%),linear-gradient(180deg,#F4F7F2_0%,#F8F9F6_48%,#EEF3ED_100%)] pb-36 text-[#17251D] sm:pb-10">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-[#F8FBF7]/75 shadow-[0_8px_30px_rgba(28,62,39,0.06)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#173C2B] text-sm font-black text-white shadow-sm">AF</div>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#278052]">Allen Farm</p>
              <h1 className="truncate text-base font-black leading-tight sm:text-lg">Packaging Report</h1>
            </div>
          </div>
          {totalSelected > 0 && (
            <button type="button" onClick={clearAll} className="shrink-0 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95">
              Reset
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-3 py-5 sm:px-6 sm:py-8">
        <section className="mb-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#278052]">Laporan harian</p>
          <h2 className="mt-1 text-[1.45rem] font-extrabold tracking-[-0.035em] text-[#17251D] sm:text-2xl">Pilih greenhouse yang dipanen</h2>
        </section>

        <section className="mb-3 rounded-[24px] border border-white/90 bg-white/72 p-4 shadow-[0_12px_35px_rgba(35,66,43,0.07)] ring-1 ring-[#DCE8DC]/70 backdrop-blur-xl sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Tanggal panen</p>
              <p className="mt-1 truncate text-sm font-extrabold capitalize text-slate-900">{formattedDate}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedDate(getLocalDateString());
                setCopied(false);
              }}
              className="shrink-0 rounded-xl bg-[#EAF4EC] px-3.5 py-2.5 text-xs font-bold text-[#236942] transition hover:bg-[#DDEEE1] active:scale-95"
            >
              Hari ini
            </button>
          </div>
          <input
            aria-label="Tanggal panen"
            type="date"
            value={selectedDate}
            onChange={(event) => {
              setSelectedDate(event.target.value);
              setCopied(false);
            }}
            className="mt-3 w-full rounded-xl border border-[#E2E9E1] bg-[#F8FAF7] px-3.5 py-3 text-sm font-semibold text-[#34463A] outline-none transition focus:border-[#38845A] focus:ring-2 focus:ring-[#CFE6D4]"
          />
        </section>

        <section className="mb-5 relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(ellipse_at_top_right,rgba(120,183,133,0.28),transparent_42%),linear-gradient(135deg,#102D22_0%,#174C35_52%,#0E3024_100%)] p-4 text-white shadow-[0_18px_40px_rgba(19,62,39,0.22)] ring-1 ring-[#3F7754]/25 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B5C9BB]">Total lokasi dipilih</p>
              <p className="mt-0.5 text-xl font-extrabold tracking-tight">
                {totalSelected} <span className="text-xs font-medium text-[#C5D6CA]">greenhouse</span>
              </p>
            </div>
            <div className="flex gap-2 text-xs font-extrabold">
              <span className="rounded-xl border border-emerald-300/15 bg-emerald-300/10 px-3 py-2 text-emerald-200">H {totalHydro}</span>
              <span className="rounded-xl border border-amber-300/15 bg-amber-300/10 px-3 py-2 text-amber-200">O {totalOrganic}</span>
            </div>
          </div>
          {totalSelected > 0 && (
            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold text-slate-400">Lokasi terpilih · ketuk × untuk menghapus</p>
                <button type="button" onClick={scrollToPreview} className="shrink-0 text-[10px] font-extrabold text-emerald-300">
                  Preview ↓
                </button>
              </div>
              <div className="flex flex-wrap gap-2 min-w-0">
                {sortedHydro.map((greenhouse) => (
                  <button
                    key={`hydro-${greenhouse}`}
                    type="button"
                    onClick={() => removeGreenhouse(greenhouse, "hydro")}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-bold text-emerald-200"
                  >
                    H {greenhouse} <span>×</span>
                  </button>
                ))}
                {sortedOrganic.map((greenhouse) => (
                  <button
                    key={`organic-${greenhouse}`}
                    type="button"
                    onClick={() => removeGreenhouse(greenhouse, "organic")}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-500/15 px-2.5 py-1.5 text-[11px] font-bold text-amber-200"
                  >
                    O {greenhouse} <span>×</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="mb-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold tracking-tight text-[#24372A]">Pilih jenis greenhouse</h3>
              <p className="mt-1 text-[11px] text-[#718174]">Ketuk salah satu kategori untuk melihat lokasinya.</p>
            </div>
            <button type="button" onClick={() => setAllSectorsOpen(activeOpenSectors.length !== Object.keys(activeSectors).length)} className="shrink-0 text-[11px] font-bold text-slate-500 underline underline-offset-2">
              {activeOpenSectors.length === Object.keys(activeSectors).length ? "Tutup semua" : "Buka semua"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("hydro")}
              aria-pressed={activeCategory === "hydro"}
              className={`group relative flex min-h-[104px] flex-col justify-between overflow-hidden rounded-2xl border p-3.5 text-left transition duration-200 active:scale-[0.98] ${activeCategory === "hydro" ? "border-emerald-600 bg-gradient-to-br from-[#E8F5EB] via-white to-[#DCEFE0] text-[#175D39] shadow-[0_7px_20px_rgba(24,79,46,0.14)] ring-2 ring-emerald-600/20" : "border-[#DCE6DB] bg-white/75 text-[#526357] shadow-sm hover:border-emerald-300 hover:bg-white"}`}
            >
              <span className="flex w-full items-start justify-between gap-2">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${activeCategory === "hydro" ? "bg-emerald-700 text-white shadow-sm" : "bg-emerald-50 text-emerald-700"}`}>H</span>
                <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[10px] font-black ${activeCategory === "hydro" ? "bg-emerald-700 text-white" : "bg-[#EDF3EC] text-[#617263]"}`}>{totalHydro}</span>
              </span>
              <span className="mt-3 block">
                <span className="flex items-center gap-1.5 text-xs font-extrabold">
                  Hidroponik
                  {activeCategory === "hydro" && (
                    <span className="text-emerald-700" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </span>
                <span className={`mt-1 block text-[10px] ${activeCategory === "hydro" ? "text-emerald-800/75" : "text-slate-500"}`}>{activeCategory === "hydro" ? "Sedang dipilih" : "Ketuk untuk memilih"}</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory("organic")}
              aria-pressed={activeCategory === "organic"}
              className={`group relative flex min-h-[104px] flex-col justify-between overflow-hidden rounded-2xl border p-3.5 text-left transition duration-200 active:scale-[0.98] ${activeCategory === "organic" ? "border-amber-500 bg-gradient-to-br from-[#FFF4DC] via-white to-[#F8E8C6] text-[#8E5718] shadow-[0_7px_20px_rgba(123,86,28,0.13)] ring-2 ring-amber-500/20" : "border-[#E8DFCE] bg-white/75 text-[#665C4D] shadow-sm hover:border-amber-300 hover:bg-white"}`}
            >
              <span className="flex w-full items-start justify-between gap-2">
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${activeCategory === "organic" ? "bg-amber-600 text-white shadow-sm" : "bg-amber-50 text-amber-700"}`}>O</span>
                <span className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[10px] font-black ${activeCategory === "organic" ? "bg-amber-600 text-white" : "bg-[#F7F0E4] text-[#806D51]"}`}>{totalOrganic}</span>
              </span>
              <span className="mt-3 block">
                <span className="flex items-center gap-1.5 text-xs font-extrabold">
                  Organik
                  {activeCategory === "organic" && (
                    <span className="text-amber-700" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </span>
                <span className={`mt-1 block text-[10px] ${activeCategory === "organic" ? "text-amber-800/75" : "text-slate-500"}`}>{activeCategory === "organic" ? "Sedang dipilih" : "Ketuk untuk memilih"}</span>
              </span>
            </button>
          </div>
        </section>

        <section className="mb-5 space-y-2.5">{Object.entries(activeSectors).map(([sector, greenhouses]) => renderSector(sector, greenhouses, activeCategory, activeOpenSectors.includes(sector)))}</section>

        <section id="report-preview" className="mb-5 scroll-mt-20 overflow-hidden rounded-[24px] border border-white/90 bg-white/75 shadow-[0_12px_35px_rgba(35,66,43,0.07)] ring-1 ring-[#DCE8DC]/70 backdrop-blur-xl">
          <div className="border-b border-[#EDF1EB] px-4 py-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Preview laporan</p>
            <h3 className="mt-0.5 text-base font-black">Laporan WhatsApp</h3>
          </div>
          <div className="bg-[#F0F3F0] p-3.5">
            <div className="ml-auto max-w-[96%] rounded-[16px] rounded-tr-[5px] border border-[#E8ECE7] bg-white p-4 shadow-[0_2px_8px_rgba(20,40,25,0.04)]">
              {totalSelected > 0 ? (
                <p className="whitespace-pre-line break-words text-sm leading-6 text-slate-700">{report}</p>
              ) : (
                <div className="py-2 text-center">
                  <p className="text-sm font-bold text-slate-500">Belum ada pilihan</p>
                  <p className="mt-1 text-xs text-slate-400">Pilih greenhouse untuk membuat laporan.</p>
                </div>
              )}
              <p className="mt-2 text-right text-[10px] text-slate-300">siap dikirim</p>
            </div>
          </div>
          <div className="p-3 sm:hidden">
            <button
              type="button"
              onClick={copyReport}
              disabled={totalSelected === 0}
              className={`w-full rounded-xl px-4 py-3 text-sm font-extrabold transition ${copied ? "bg-[#EAF4EC] text-[#236942]" : totalSelected > 0 ? "bg-emerald-600 text-white" : "cursor-not-allowed bg-slate-100 text-slate-400"}`}
            >
              {copied ? "✓ Laporan tersalin" : "Salin laporan"}
            </button>
          </div>
        </section>

        <section className="hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:block">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-slate-900">Laporan sudah sesuai?</p>
              <p className="mt-1 text-xs text-slate-500">Salin lalu tempel ke grup WhatsApp packaging.</p>
            </div>
            <button
              type="button"
              onClick={copyReport}
              disabled={totalSelected === 0}
              className={`shrink-0 rounded-xl px-5 py-3 text-sm font-extrabold transition ${copied ? "bg-[#EAF4EC] text-[#236942]" : totalSelected > 0 ? "bg-emerald-600 text-white hover:bg-emerald-700" : "cursor-not-allowed bg-slate-100 text-slate-400"}`}
            >
              {copied ? "✓ Laporan tersalin" : "Salin laporan"}
            </button>
          </div>
        </section>

        <footer className="mt-6 pb-2 text-center">
          <p className="text-[11px] font-bold text-slate-400">Allen Farm Packaging</p>
          <p className="mt-1 text-[10px] text-slate-300">Laporan Packaging Harian</p>
        </footer>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/80 bg-[#F7FAF5]/78 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_36px_rgba(20,48,29,0.13)] backdrop-blur-2xl sm:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5">
          <button
            type="button"
            onClick={scrollToPreview}
            className="flex min-h-12 shrink-0 flex-col items-center justify-center rounded-xl border border-white/90 bg-white/70 px-3 text-[#315641] shadow-[0_4px_14px_rgba(26,61,37,0.06)] backdrop-blur-xl transition active:scale-95"
          >
            <span className="text-xs font-extrabold">{totalSelected}</span>
            <span className="text-[9px] font-bold">Preview</span>
          </button>
          <button
            type="button"
            onClick={copyReport}
            disabled={totalSelected === 0}
            className={`min-h-12 flex-1 rounded-xl px-4 text-sm font-extrabold transition active:scale-[0.99] ${copied ? "bg-[#EAF4EC] text-[#236942]" : totalSelected > 0 ? "bg-gradient-to-r from-[#17623B] via-[#21804C] to-[#17623B] text-white shadow-[0_7px_20px_rgba(28,112,65,0.28)] ring-1 ring-white/15 hover:brightness-105" : "cursor-not-allowed bg-slate-200 text-slate-400"}`}
          >
            {copied ? "✓ Laporan tersalin" : totalSelected > 0 ? "Salin laporan" : "Pilih greenhouse dahulu"}
          </button>
        </div>
      </div>
    </main>
  );
}
