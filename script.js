// Línea de tiempo interactiva: alterna la visibilidad del detalle de cada etapa.
document.addEventListener("DOMContentLoaded", function () {
  var timelineItems = document.querySelectorAll(".timeline-item");

  timelineItems.forEach(function (item) {
    var toggleButton = item.querySelector(".timeline-toggle");
    var detail = item.querySelector(".timeline-detail");

    if (!toggleButton || !detail) return;

    toggleButton.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");

      item.classList.toggle("is-open", !isOpen);
      toggleButton.setAttribute("aria-expanded", String(!isOpen));
      detail.hidden = isOpen;

      if (window.CR7Observability) {
        var yearEl = toggleButton.querySelector(".timeline-year");
        var titleEl = toggleButton.querySelector(".timeline-title");
        window.CR7Observability.log("timeline_toggle", {
          year: yearEl ? yearEl.textContent.trim() : null,
          title: titleEl ? titleEl.textContent.trim() : null,
          expanded: !isOpen
        });
      }
    });
  });
});
