export function readMeasurement(hastaText, multiplierText) {
  const parse = (text) =>
    /^\d+(?:[.,]\d+)?$/.test(String(text || "").trim())
      ? Number(String(text).trim().replace(",", "."))
      : NaN;
  const hasta = parse(hastaText);
  const multiplier = parse(multiplierText);
  const hastaValid = Number.isFinite(hasta) && hasta >= 15 && hasta <= 80;
  const multiplierValid = Number.isInteger(multiplier) && multiplier >= 1 && multiplier <= 10;
  return {
    hasta,
    multiplier,
    hastaValid,
    multiplierValid,
    valid: hastaValid && multiplierValid,
    result:
      hastaValid && multiplierValid
        ? Number((hasta * multiplier).toFixed(6))
        : null,
  };
}

export function setupMeasurement(app) {
  app.readMeasurement = readMeasurement;

  const hastaInput = document.getElementById("hasta-input");
  if (!hastaInput) {
    app.initMeasurement = () => {};
    app.renderMeasurement = () => {};
    return;
  }

  app.renderMeasurement = () => {
    const value = app.readMeasurement(
      app.state.hastaCm,
      app.state.multiplier,
    );

    [
      [
        "hasta",
        value.hastaValid,
        "Masukkan panjang 15–80 cm, misalnya 45 atau 45,5.",
      ],
      [
        "multiplier",
        value.multiplierValid,
        "Masukkan bilangan bulat 1–10.",
      ],
    ].forEach(([name, valid, message]) => {
      const inputEl = document.getElementById(`${name}-input`);
      if (inputEl) inputEl.setAttribute("aria-invalid", String(!valid));
      const errorEl = document.getElementById(`${name}-error`);
      if (errorEl) {
        errorEl.textContent = valid ? "" : message;
        errorEl.hidden = valid;
      }
    });

    const equation = document.getElementById("equation");
    const result = document.getElementById("measure-result");
    const resultInvalid = document.getElementById("result-invalid");
    const resultLine = document.getElementById("result-line");
    const scaleTitle = document.getElementById("scale-title");

    if (equation) equation.hidden = !value.valid;
    if (result) result.hidden = !value.valid;
    if (resultInvalid) resultInvalid.hidden = value.valid;
    if (resultLine) resultLine.hidden = !value.valid;

    const dimLine = document.getElementById("bale-dim-line");
    const dimRightTick = document.getElementById("bale-dim-right-tick");
    const dimLabel = document.getElementById("bale-dim-label");
    const spanHighlight = document.getElementById("bale-span-highlight");

    if (value.valid) {
      if (equation) {
        equation.textContent = `${value.multiplier} × ${app.number.format(value.hasta)} cm`;
      }
      if (result) {
        result.replaceChildren(
          document.createTextNode(`${app.number.format(value.result)} `),
        );
        const unit = document.createElement("span");
        unit.textContent = "cm";
        result.append(unit);
      }
      if (resultLine) {
        resultLine.setAttribute("d", `M20 30H${20 + (value.result / 800) * 460}`);
      }
      if (scaleTitle) {
        scaleTitle.textContent = `Panjang ilustratif ${app.number.format(value.result)} cm pada skala 0 sampai 800 cm`;
      }

      if (dimLine && dimRightTick && dimLabel) {
        const startX = 84;
        const maxSpanWidth = 320;
        const currentSpan = Math.min(maxSpanWidth, (value.result / 800) * maxSpanWidth);
        const endX = startX + currentSpan;

        dimLine.setAttribute("d", `M ${startX},32 L ${endX},32`);
        dimLine.hidden = false;
        dimRightTick.setAttribute("x1", String(endX));
        dimRightTick.setAttribute("x2", String(endX));
        dimRightTick.hidden = false;
        dimLabel.setAttribute("x", String(startX + currentSpan / 2));
        dimLabel.textContent = `${app.number.format(value.result)} cm (${value.multiplier} hasta)`;
        dimLabel.hidden = false;

        if (spanHighlight) {
          spanHighlight.setAttribute("width", String(currentSpan));
          spanHighlight.hidden = false;
        }
      }
    } else {
      if (scaleTitle) {
        scaleTitle.textContent = "Belum ada hasil valid. Skala referensi 0 sampai 800 cm.";
      }
      if (dimLine) dimLine.hidden = true;
      if (dimRightTick) dimRightTick.hidden = true;
      if (dimLabel) dimLabel.hidden = true;
      if (spanHighlight) spanHighlight.hidden = true;
    }

    const subBtn = document.getElementById("subtract");
    if (subBtn) {
      subBtn.disabled = !value.multiplierValid || value.multiplier <= 1;
    }
    const addBtn = document.getElementById("add");
    if (addBtn) {
      addBtn.disabled = !value.multiplierValid || value.multiplier >= 10;
    }
  };

  app.initMeasurement = () => {
    const form = document.getElementById("measure-form");
    if (form) {
      form.addEventListener("submit", (event) => event.preventDefault());
    }

    function update() {
      const hInput = document.getElementById("hasta-input");
      const mInput = document.getElementById("multiplier-input");
      if (hInput) app.state.hastaCm = hInput.value;
      if (mInput) app.state.multiplier = mInput.value;
      app.renderMeasurement();
    }

    ["hasta-input", "multiplier-input"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", update);
    });

    [
      ["subtract", -1],
      ["add", 1],
    ].forEach(([id, change]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => {
          const value = app.readMeasurement(
            app.state.hastaCm,
            app.state.multiplier,
          );
          if (!value.multiplierValid) return;
          const targetInput = document.getElementById("multiplier-input");
          if (targetInput) {
            targetInput.value = String(
              Math.min(10, Math.max(1, value.multiplier + change)),
            );
          }
          update();
        });
      }
    });

    app.renderMeasurement();
  };
}
