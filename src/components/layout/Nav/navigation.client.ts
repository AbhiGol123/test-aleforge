export function initNavigation() {
  document.addEventListener("DOMContentLoaded", () => {
    const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
    const navContainer = document.querySelector(".nav-container") as HTMLElement | null;
    const dropdowns = document.querySelectorAll<HTMLElement>(".dropdown");

    if (mobileMenuToggle && navContainer) {
      // Toggle Mobile Menu
      mobileMenuToggle.addEventListener("click", () => {
        mobileMenuToggle.classList.toggle("active");
        navContainer.classList.toggle("mobile-open");
        document.body.classList.toggle("menu-open");

        if (!navContainer.classList.contains("mobile-open")) {
          navContainer.classList.remove("dropdown-open");
          dropdowns.forEach((d) => d.classList.remove("active"));
        }
      });

      // Mobile Dropdown Toggle
      dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector(".nav-link");
        if (toggle) {
          toggle.addEventListener("click", (e) => {
            if (window.innerWidth <= 1090) {
              e.preventDefault();

              const wasActive = dropdown.classList.contains("active");
              dropdowns.forEach((d) => d.classList.remove("active"));

              if (!wasActive) {
                dropdown.classList.add("active");
              }

              const anyActive = Array.from(dropdowns).some((d) =>
                d.classList.contains("active")
              );

              navContainer.classList.toggle("dropdown-open", anyActive);
            }
          });
        }
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (
          navContainer.classList.contains("mobile-open") &&
          !navContainer.contains(e.target as Node)
        ) {
          mobileMenuToggle.classList.remove("active");
          navContainer.classList.remove("mobile-open", "dropdown-open");
          dropdowns.forEach((d) => d.classList.remove("active"));
          document.body.classList.remove("menu-open");
        }
      });
    }
     });
}
