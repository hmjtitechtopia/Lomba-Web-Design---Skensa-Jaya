import { setupAssistant } from "./assistant.js";
import { app } from './content.js';
import { setupBlueprint } from './blueprint.js';
import { setupMeasurement } from './measurement.js';
import { setupNavigation } from './navigation.js';
import { setupMotion } from './motion.js';

setupBlueprint(app);
setupMeasurement(app);

if (document.getElementById("zone-layer")) {
  app.initBlueprint();
  app.renderBlueprint();
  app.renderOrientation();
}

if (document.getElementById("hasta-input")) {
  app.initMeasurement();
}

document.querySelectorAll("[data-enhance]").forEach((element) => {
  element.hidden = false;
});

document.querySelectorAll("[data-preset]").forEach((button) =>
  button.addEventListener("click", () =>
    app.setPreset(button.dataset.preset),
  ),
);

document.querySelectorAll("[data-angga-target]").forEach((btn) => {
  btn.setAttribute("aria-controls", "tri-angga-diagram");
  btn.addEventListener("click", () => {
    const target = btn.dataset.anggaTarget;
    const diagram = document.getElementById("tri-angga-diagram");
    const status = document.getElementById("tri-angga-status");
    if (diagram) diagram.dataset.angga = target;
    if (status) status.textContent = btn.querySelector("strong").textContent;
    document.querySelectorAll("[data-angga-target]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.anggaTarget === target));
    });
  });
});

setupNavigation();
setupMotion();

setupAssistant();
