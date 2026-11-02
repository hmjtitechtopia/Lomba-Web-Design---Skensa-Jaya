export function setupNavigation() {
  const header = document.getElementById("site-header");
  const menu = document.getElementById("navigation");
  const menuButton = document.getElementById("menu-button");
  if (!header || !menu) return;

  header.classList.add("enhanced");
  if (menuButton) menuButton.hidden = false;
  const pageContent = document.querySelectorAll("main, .site-footer, .skip-link");

  function closeMenu(returnFocus) {
    const wasOpen = menu.classList.contains("open");
    menu.classList.remove("open");
    pageContent.forEach((element) => { element.inert = false; });
    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.textContent = "Menu";
      if (returnFocus && wasOpen) menuButton.focus();
    }
  }

  if (menuButton) {
    menuButton.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      pageContent.forEach((element) => { element.inert = open; });
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.textContent = open ? "Tutup \u2715" : "Menu";
    });
  }

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu(true);
  });

  const normalize = (path) => (path.endsWith("/") ? "index" : path.split("/").pop()).replace(/\.html$/, "");
  const currentPath = normalize(window.location.pathname);
  menu.querySelectorAll("a").forEach((link) => {
    const linkHref = link.getAttribute("href") || "";
    const linkFile = normalize(new URL(linkHref, window.location.href).pathname);
    if (
      linkFile === currentPath
    ) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const updateHeaderState = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    header.classList.toggle("is-scrolled", scrollY > 80);

    const footer = document.querySelector(".site-footer") || document.getElementById("footer-dark");
    const isOverFooter = footer
      ? footer.getBoundingClientRect().top <= 80
      : false;
    header.classList.toggle("is-footer", isOverFooter);

    const darkSections = [document.getElementById("orientasi"), footer];
    const overDark = darkSections.some((sec) => {
      if (!sec) return false;
      const rect = sec.getBoundingClientRect();
      return rect.top <= 44 && rect.bottom >= 44;
    });
    header.classList.toggle("is-inverted", overDark);
  };

  let pendingFrame = false;
  window.addEventListener(
    "scroll",
    () => {
      if (pendingFrame) return;
      pendingFrame = true;
      requestAnimationFrame(() => {
        updateHeaderState();
        pendingFrame = false;
      });
    },
    { passive: true },
  );
  updateHeaderState();

  window
    .matchMedia("(min-width: 861px)")
    .addEventListener("change", () => closeMenu(false));
}
