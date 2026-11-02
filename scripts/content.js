const DEFAULT_SOURCES = {
  "B-01": { anchor: "ref-b01", title: "Konsep Sanga Mandala dalam Arsitektur Tradisional Bali", url: "https://tarubali.baliprov.go.id/konsep-sanga-mandala-dalam-arsitektur-tradisional-bali/" },
  "B-02": { anchor: "ref-b02", title: "Arah Orientasi Ruang Wilayah", url: "https://tarubali.baliprov.go.id/arah-orientasi-ruang-wilayah/" },
  "B-03": { anchor: "ref-b03", title: "Kaja-Kelod: Antara Gunung dan Laut, Membaca Orientasi Gumi Bali", url: "https://tarubali.baliprov.go.id/kaja-kelod-antara-gunung-dan-laut-membaca-orientasi-gumi-bali/" },
  "B-04": { anchor: "ref-b04", title: "Transformasi Arsitektur Bale Daja", url: "https://dimensi.petra.ac.id/index.php/ars./article/view/16972" },
  "B-05": { anchor: "ref-b05", title: "Study of the Application of Asta Kosala Kosali and Sikut Satak", url: "https://ejournal2.unud.ac.id/index.php/jsgs/en/article/view/2340" },
  "B-06": { anchor: "ref-b06", title: "Identifikasi Perubahan Konsep Arsitektur Tradisional Bali pada Hasil Revitalisasi Pasar Seni Sukawati, Bali", url: "https://e-journal.ukri.ac.id/arcade/article/download/3841/980" },
  "B-07": { anchor: "ref-b07", title: "Ashta Bhumi, Panduan Pembuatan Lay Out Ruang Bangunan Hunian Rumah Tinggal Tradisional Bali Madya", url: "https://jurnal.isi-dps.ac.id/index.php/mudra/article/download/1321/576/2715" },
};

const DEFAULT_ZONES = [
  { id: "kaja-kauh", label: "Kaja-Kauh", rowSouth: 0, column: 0, classification: "Pertemuan dua sumbu", description: "Pertemuan sisi kaja dan kauh (barat).", sourceIds: ["B-01", "B-03", "B-07"], number: "01" },
  { id: "kaja", label: "Kaja", rowSouth: 0, column: 1, classification: "Sumbu kaja-kelod", description: "Sisi kaja, yang pada contoh ini mengarah ke gunung.", sourceIds: ["B-01", "B-03", "B-04", "B-07"], number: "02" },
  { id: "kaja-kangin", label: "Kaja-Kangin", rowSouth: 0, column: 2, classification: "Pertemuan dua sumbu", description: "Pertemuan sisi kaja dan kangin (timur).", sourceIds: ["B-01", "B-03", "B-06"], number: "03" },
  { id: "kauh", label: "Kauh", rowSouth: 1, column: 0, classification: "Sumbu kangin-kauh", description: "Bagian tengah pada sisi barat.", sourceIds: ["B-01", "B-03", "B-07"], number: "04" },
  { id: "madya", label: "Madya", rowSouth: 1, column: 1, classification: "Pusat orientasi", description: "Bagian tengah skema pekarangan, dicontohkan sebagai natah atau ruang terbuka.", sourceIds: ["B-01", "B-06", "B-07"], number: "05" },
  { id: "kangin", label: "Kangin", rowSouth: 1, column: 2, classification: "Sumbu kangin-kauh", description: "Bagian tengah pada sisi timur.", sourceIds: ["B-01", "B-03", "B-07"], number: "06" },
  { id: "kelod-kauh", label: "Kelod-Kauh", rowSouth: 2, column: 0, classification: "Pertemuan dua sumbu", description: "Pertemuan sisi kelod dan kauh (barat).", sourceIds: ["B-01", "B-03", "B-07"], number: "07" },
  { id: "kelod", label: "Kelod", rowSouth: 2, column: 1, classification: "Sumbu kaja-kelod", description: "Sisi kelod, yang pada contoh ini mengarah ke laut.", sourceIds: ["B-01", "B-03", "B-07"], number: "08" },
  { id: "kelod-kangin", label: "Kelod-Kangin", rowSouth: 2, column: 2, classification: "Pertemuan dua sumbu", description: "Pertemuan sisi kelod dan kangin (timur).", sourceIds: ["B-01", "B-03", "B-07"], number: "09" }
];

function parseSourcesFromDom() {
  const items = Array.from(document.querySelectorAll('.reference-list > li'));
  if (!items.length) return DEFAULT_SOURCES;
  return Object.fromEntries(items.map((item) => {
    const link = item.querySelector('a[href]');
    const key = item.querySelector('span')?.textContent.trim().slice(0, 4) || item.id;
    return [key, {
      anchor: item.id,
      title: link ? link.textContent.replace(/↗/g, '').trim() : '',
      url: link ? link.href : '',
    }];
  }));
}

export const app = {
  sources: parseSourcesFromDom(),
  zones: DEFAULT_ZONES,
  state: {
    orientationPreset: "south",
    selectedZoneId: "madya",
    hastaCm: "45",
    multiplier: "3",
  },
  number: new Intl.NumberFormat("id-ID", { maximumFractionDigits: 6 }),
  presetName(preset) {
    return preset === "south" ? "Bali Selatan" : "Bali Utara";
  },
  position(zone, preset) {
    const row = preset === "south" ? zone.rowSouth : 2 - zone.rowSouth;
    return {
      row,
      column: zone.column,
      label: [
        ["Barat laut", "Utara", "Timur laut"],
        ["Barat", "Tengah", "Timur"],
        ["Barat daya", "Selatan", "Tenggara"],
      ][row][zone.column],
    };
  },
  mapping(preset) {
    if (!["south", "north"].includes(preset)) {
      throw new Error("Preset tidak dikenal");
    }
    const positions = this.zones.map((zone) => ({
      zone,
      ...this.position(zone, preset),
    }));
    if (
      positions.length !== 9 ||
      new Set(positions.map((item) => item.zone.id)).size !== 9 ||
      new Set(positions.map((item) => `${item.row}:${item.column}`)).size !== 9
    ) {
      throw new Error("Pemetaan zona tidak lengkap");
    }
    return positions;
  },
};
