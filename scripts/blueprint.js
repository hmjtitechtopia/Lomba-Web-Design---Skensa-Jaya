import { svgNode } from "./svg.js";

const ZONE_BUILDINGS = {
  "kaja-kangin": "Sanggah / Merajan (Pemerajan)",
  "kaja": "Bale Daja (Bale Meten)",
  "kaja-kauh": "Bale Gede / Istirahat",
  "kauh": "Bale Dauh (Bale Loji)",
  "madya": "Natah (Ruang Terbuka)",
  "kangin": "Bale Dangin (Sakenem)",
  "kelod-kauh": "Paon (Dapur Tradisional)",
  "kelod": "Angkul-angkul (Gerbang)",
  "kelod-kangin": "Jineng / Klumpu (Lumbung)"
};

export function setupBlueprint(app) {
  const layer = document.getElementById("zone-layer");
  const list = document.getElementById("zone-list-controls");
  if (!layer) {
    app.initBlueprint = () => {};
    app.renderBlueprint = () => {};
    app.selectZone = () => {};
    app.renderOrientation = () => {};
    app.setPreset = () => {};
    return;
  }

  app.initBlueprint = () => {
    const fragment = document.createDocumentFragment();
    const listFragment = document.createDocumentFragment();
    app.zones.forEach((zone) => {
      const control = svgNode("g", {
        class: "zone-control",
        role: "button",
        tabindex: "0",
        "data-zone": zone.id,
        "aria-pressed": "false",
        "aria-controls": "detail-title",
      });
      control.append(
        svgNode("rect", {
          class: "zone-background",
          x: 4,
          y: 4,
          width: 132,
          height: 132,
          rx: 6,
        }),
        svgNode("image", {
          class: "zone-cell-thumb",
          href: `./assets/images/arah/${zone.id}.webp`,
          x: 28,
          y: 12,
          width: 84,
          height: 84,
          preserveAspectRatio: "xMidYMid meet",
        }),
        svgNode("text", {
          class: "zone-label",
          x: 70,
          y: 118,
          "text-anchor": "middle",
        }, zone.label),
      );
      control.addEventListener("click", () => app.selectZone(zone.id));
      control.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          app.selectZone(zone.id);
        }
      });
      fragment.append(control);
      if (list) {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.zoneList = zone.id;
        button.setAttribute("aria-controls", "zone-detail");
        button.textContent = `${zone.label} · ${ZONE_BUILDINGS[zone.id] || ""}`;
        button.addEventListener("click", () => app.selectZone(zone.id));
        listFragment.append(button);
      }
    });

    layer.replaceChildren(fragment);
    if (list) list.replaceChildren(listFragment);
    const staticGrid = document.getElementById("static-grid");
    if (staticGrid) staticGrid.setAttribute("hidden", "");
  };

  app.renderBlueprint = () => {
    const positions = app.mapping(app.state.orientationPreset);
    positions.forEach(({ zone, row, column, label }) => {
      const control = layer.querySelector(`[data-zone="${zone.id}"]`);
      const selected = app.state.selectedZoneId === zone.id;
      if (control) {
        control.setAttribute(
          "transform",
          `translate(${30 + column * 140} ${50 + row * 140})`,
        );
        control.setAttribute(
          "aria-label",
          `${zone.label}, ${label}, ${selected ? "terpilih" : "pilih zona"}`,
        );
        control.setAttribute("aria-pressed", String(selected));
      }
      const listControl = list?.querySelector(`[data-zone-list="${zone.id}"]`);
      if (listControl) listControl.setAttribute("aria-pressed", String(selected));
    });

    const sorted = positions
      .slice()
      .sort((a, b) => a.row * 3 + a.column - b.row * 3 - b.column);
    const focused = document.activeElement;
    if (layer.firstElementChild && sorted[0] && layer.firstElementChild.dataset.zone !== sorted[0].zone.id) {
      sorted.forEach(({ zone }) => {
        const ctrl = layer.querySelector(`[data-zone="${zone.id}"]`);
        if (ctrl) layer.append(ctrl);
      });
      if (focused && layer.contains(focused)) {
        focused.focus({ preventScroll: true });
      }
    }
    if (list?.firstElementChild && list.firstElementChild.dataset.zoneList !== sorted[0].zone.id) {
      sorted.forEach(({ zone }) => {
        const button = list.querySelector(`[data-zone-list="${zone.id}"]`);
        if (button) list.append(button);
      });
      if (focused && list.contains(focused)) focused.focus({ preventScroll: true });
    }

    const bpTitle = document.getElementById("blueprint-title");
    if (bpTitle) {
      bpTitle.textContent = `Sembilan zona, preset ${app.presetName(app.state.orientationPreset)}`;
    }

    const zone = app.zones.find((item) => item.id === app.state.selectedZoneId);

    const numberEl = document.getElementById("detail-number");
    if (numberEl) {
      numberEl.hidden = !zone;
      numberEl.textContent = zone ? `Zona ${zone.number} · ${zone.classification}` : "";
    }

    const titleEl = document.getElementById("detail-title");
    if (titleEl) {
      titleEl.textContent = zone ? zone.label : "Pilih satu zona";
    }

    const descEl = document.getElementById("detail-description");
    if (descEl) {
      descEl.textContent = zone
        ? zone.description
        : "Pilih salah satu petak zona untuk membaca karakteristik ruangnya.";
    }

    const buildingEl = document.getElementById("detail-building-name");
    if (buildingEl) {
      buildingEl.textContent = zone && ZONE_BUILDINGS[zone.id] ? ZONE_BUILDINGS[zone.id] : "";
    }

    const plateImg = document.getElementById("detail-zone-plate");
    if (plateImg && zone) {
      plateImg.src = `./assets/images/arah/${zone.id}.webp`;
      plateImg.alt = `Ilustrasi contoh zona ${zone.label} (${ZONE_BUILDINGS[zone.id] || ''})`;
    }

    const plateCaption = document.getElementById("detail-plate-caption");
    if (plateCaption && zone) {
      plateCaption.textContent = `Contoh: ${ZONE_BUILDINGS[zone.id] || zone.label}`;
    }

    const sourcesEl = document.getElementById("detail-sources");
    if (sourcesEl) {
      sourcesEl.replaceChildren(document.createTextNode("Rujukan: "));
      (zone?.sourceIds || []).forEach((id) => {
        const source = app.sources[id];
        if (!source) return;
        const link = document.createElement("a");
        link.href = `./edukasi.html#${source.anchor}`;
        link.textContent = `[${id}]`;
        link.className = "citation";
        sourcesEl.append(link, document.createTextNode(" "));
      });
    }

  };

  app.selectZone = (id) => {
    if (!app.zones.some((zone) => zone.id === id)) return;
    app.state.selectedZoneId = id;
    app.renderBlueprint();
    const zone = app.zones.find((item) => item.id === id);
    const ann = document.getElementById("zone-announcement");
    if (ann && zone) {
      ann.textContent = `${zone.label}. ${app.position(zone, app.state.orientationPreset).label}. ${zone.description}`;
    }
  };

  app.renderOrientation = () => {
    const south = app.state.orientationPreset === "south";
    document.querySelectorAll("[data-preset]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.preset === app.state.orientationPreset),
      );
    });
    document.querySelectorAll("[data-preset-label]").forEach((label) => {
      label.textContent = app.presetName(app.state.orientationPreset);
    });
    const mapEl = document.getElementById("bali-island-map");
    if (mapEl) {
      mapEl.setAttribute("data-active-preset", app.state.orientationPreset);
    }
    const axisTop = document.getElementById("blueprint-axis-top");
    if (axisTop) {
      axisTop.textContent = south
        ? "↑ Utara · Kaja (arah gunung)"
        : "↑ Utara · Kelod (arah laut Bali)";
    }
    const axisBottom = document.getElementById("blueprint-axis-bottom");
    if (axisBottom) {
      axisBottom.textContent = south
        ? "↓ Selatan · Kelod (arah laut)"
        : "↓ Selatan · Kaja (arah gunung)";
    }
  };

  app.setPreset = (preset) => {
    const previous = app.state.orientationPreset;
    const errorMessage = document.getElementById("orientation-error");
    try {
      app.mapping(preset);
      app.state.orientationPreset = preset;
      app.renderBlueprint();
      app.renderOrientation();
      if (errorMessage) errorMessage.hidden = true;
      const legendDesc =
        preset === "south"
          ? "Kaja di utara, Kelod di selatan"
          : "Kaja di selatan, Kelod di utara";
      const ann = document.getElementById("zone-announcement");
      if (ann) {
        ann.textContent = `${app.presetName(preset)} aktif. ${legendDesc}.${app.state.selectedZoneId ? " Zona pilihan dipertahankan." : ""}`;
      }
    } catch (error) {
      app.state.orientationPreset = previous;
      app.renderBlueprint();
      app.renderOrientation();
      console.error("Orientasi tidak dapat diperbarui:", error);
      if (errorMessage) {
        errorMessage.textContent = "Orientasi belum dapat diperbarui. Preset sebelumnya tetap digunakan.";
        errorMessage.hidden = false;
      }
    }
  };
}
