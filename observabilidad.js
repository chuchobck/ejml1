/*
 * CR7 Observability — motor de observabilidad local (sin backend, sin envío de datos).
 * Todo se guarda en localStorage bajo claves con el prefijo "cr7-observability".
 * Este archivo se incluye tanto en index.html (instrumentación silenciosa) como en
 * observabilidad.html (instrumentación + panel de control).
 */
(function (window, document) {
  "use strict";

  if (window.CR7Observability) {
    // Ya inicializado (por ejemplo si el script se incluyó dos veces).
    return;
  }

  var PREFIX = "cr7-observability";
  var EVENTS_KEY = PREFIX + ":events";
  var SESSION_KEY = PREFIX + ":session";
  var MAX_EVENTS = 200;
  var memoryEvents = [];
  var memorySession = {};
  var initialized = false;

  // ---------- Utilidades de almacenamiento seguras ----------

  function hasLocalStorage() {
    try {
      var testKey = PREFIX + ":__test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  var storageAvailable = hasLocalStorage();

  function safeGetJSON(key, fallback) {
    if (!storageAvailable) return fallback;
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function safeSetJSON(key, value) {
    if (!storageAvailable) return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function generateId() {
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
  }

  // ---------- Registro de eventos ----------

  function pushEvent(type, detail) {
    var events = storageAvailable ? safeGetJSON(EVENTS_KEY, []) : memoryEvents;

    events.push({
      id: generateId(),
      ts: new Date().toISOString(),
      type: type,
      page: window.location.pathname,
      detail: detail || {}
    });

    if (events.length > MAX_EVENTS) {
      events = events.slice(events.length - MAX_EVENTS);
    }

    if (storageAvailable) {
      safeSetJSON(EVENTS_KEY, events);
    } else {
      memoryEvents = events;
    }

    return events;
  }

  function log(type, detail) {
    if (!type) return;
    return pushEvent(String(type), detail);
  }

  // ---------- Sesión: viewport, conexión, soporte de APIs ----------

  function detectApiSupport() {
    return {
      performance: !!window.performance,
      performanceObserver: typeof window.PerformanceObserver === "function",
      navigationTiming: !!(window.performance && typeof window.performance.getEntriesByType === "function"),
      localStorage: storageAvailable,
      connectionApi: !!(navigator.connection || navigator.mozConnection || navigator.webkitConnection),
      visibilityApi: typeof document.visibilityState !== "undefined",
      serviceWorker: !!navigator.serviceWorker
    };
  }

  function getConnectionInfo() {
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return null;
    return {
      effectiveType: conn.effectiveType || null,
      downlink: typeof conn.downlink === "number" ? conn.downlink : null,
      rtt: typeof conn.rtt === "number" ? conn.rtt : null,
      saveData: !!conn.saveData
    };
  }

  function captureSession() {
    var session = {
      updatedAt: new Date().toISOString(),
      page: window.location.pathname,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1
      },
      connection: getConnectionInfo(),
      apiSupport: detectApiSupport(),
      userAgent: navigator.userAgent,
      language: navigator.language
    };

    memorySession = session;
    safeSetJSON(SESSION_KEY, session);
    return session;
  }

  // ---------- Instrumentación: rendimiento de navegación ----------

  function logNavigationTiming() {
    if (!window.performance) return;

    var detail = {};

    if (typeof window.performance.getEntriesByType === "function") {
      var navEntries = window.performance.getEntriesByType("navigation");
      if (navEntries && navEntries.length > 0) {
        var nav = navEntries[0];
        detail = {
          source: "PerformanceNavigationTiming",
          type: nav.type,
          domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
          loadEventEnd: Math.round(nav.loadEventEnd),
          responseStart: Math.round(nav.responseStart),
          domInteractive: Math.round(nav.domInteractive),
          transferSize: nav.transferSize || null,
          duration: Math.round(nav.duration)
        };
      }
    }

    if (!detail.source && window.performance.timing) {
      // Fallback para navegadores sin PerformanceNavigationTiming (Navigation Timing L1).
      var t = window.performance.timing;
      if (t.loadEventEnd > 0 && t.navigationStart > 0) {
        detail = {
          source: "PerformanceTiming (legacy)",
          domContentLoaded: t.domContentLoadedEventEnd - t.navigationStart,
          loadEventEnd: t.loadEventEnd - t.navigationStart,
          responseStart: t.responseStart - t.navigationStart,
          domInteractive: t.domInteractive - t.navigationStart
        };
      }
    }

    if (detail.source) {
      log("performance_navigation", detail);
    }
  }

  // ---------- Instrumentación: errores JS y promesas rechazadas ----------

  function handleWindowError(event) {
    var target = event.target || event.srcElement;
    var isResourceError = target && target !== window && (target.src || target.href);

    if (isResourceError) {
      log("resource_error", {
        tagName: target.tagName ? target.tagName.toLowerCase() : "desconocido",
        source: target.src || target.href || null
      });
      return;
    }

    log("js_error", {
      message: event.message || "Error desconocido",
      filename: event.filename || null,
      lineno: event.lineno || null,
      colno: event.colno || null,
      stack: event.error && event.error.stack ? String(event.error.stack).slice(0, 500) : null
    });
  }

  function handleRejection(event) {
    var reason = event.reason;
    var message;
    var stack = null;

    if (reason instanceof Error) {
      message = reason.message;
      stack = reason.stack ? String(reason.stack).slice(0, 500) : null;
    } else {
      try {
        message = JSON.stringify(reason);
      } catch (e) {
        message = String(reason);
      }
    }

    log("unhandled_rejection", { message: message, stack: stack });
  }

  // ---------- Instrumentación: clics en controles interactivos ----------

  function describeElement(el) {
    var text = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80);
    return {
      tagName: el.tagName ? el.tagName.toLowerCase() : null,
      id: el.id || null,
      className: (el.className && typeof el.className === "string") ? el.className : null,
      text: text || null,
      href: el.getAttribute ? el.getAttribute("href") : null
    };
  }

  function handleClick(event) {
    var el = event.target;
    var selector = "a, button, input[type='button'], input[type='submit'], input[type='checkbox'], input[type='radio'], select, [role='button']";

    while (el && el !== document.body && el.nodeType === 1) {
      if (el.matches && el.matches(selector)) {
        log("click", describeElement(el));
        return;
      }
      el = el.parentElement;
    }
  }

  // ---------- Instrumentación: visibilidad de la pestaña ----------

  function handleVisibilityChange() {
    if (typeof document.visibilityState === "undefined") return;
    log("visibility_change", { state: document.visibilityState });
  }

  // ---------- Instrumentación: cambios de viewport/conexión ----------

  var resizeTimer = null;
  function handleResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      captureSession();
    }, 300);
  }

  // ---------- API pública ----------

  function getSnapshot() {
    return {
      generatedAt: new Date().toISOString(),
      session: storageAvailable ? safeGetJSON(SESSION_KEY, memorySession) : memorySession,
      events: storageAvailable ? safeGetJSON(EVENTS_KEY, []) : memoryEvents
    };
  }

  function clearAll() {
    memoryEvents = [];
    memorySession = {};

    if (!storageAvailable) return true;

    try {
      var keysToRemove = [];
      for (var i = 0; i < window.localStorage.length; i++) {
        var key = window.localStorage.key(i);
        if (key && key.indexOf(PREFIX) === 0) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(function (key) {
        window.localStorage.removeItem(key);
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  function recordDemoEvent() {
    return log("demo_event", {
      message: "Evento de demostración generado manualmente desde el panel.",
      randomValue: Math.round(Math.random() * 1000)
    });
  }

  function init() {
    if (initialized) return;
    initialized = true;

    captureSession();

    window.addEventListener("error", handleWindowError, true);
    window.addEventListener("unhandledrejection", handleRejection);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("resize", handleResize);

    if (navigator.connection && typeof navigator.connection.addEventListener === "function") {
      navigator.connection.addEventListener("change", captureSession);
    }

    if (document.readyState === "complete") {
      logNavigationTiming();
    } else {
      window.addEventListener("load", function () {
        // Los datos de tiempos de navegación no siempre están completos
        // hasta un instante después del evento load.
        window.setTimeout(logNavigationTiming, 0);
      });
    }
  }

  window.CR7Observability = {
    PREFIX: PREFIX,
    log: log,
    getSnapshot: getSnapshot,
    clearAll: clearAll,
    recordDemoEvent: recordDemoEvent,
    captureSession: captureSession,
    isStorageAvailable: function () {
      return storageAvailable;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // ---------- Panel de control (solo si el DOM del dashboard está presente) ----------

  function setupDashboard() {
    var root = document.getElementById("cr7-dashboard");
    if (!root) return;

    var statusEl = document.getElementById("cr7-status");
    var storageStateEl = document.getElementById("cr7-storage-state");
    var generatedAtEl = document.getElementById("cr7-generated-at");
    var eventCountEl = document.getElementById("cr7-event-count");
    var sessionEl = document.getElementById("cr7-session");
    var eventsBody = document.getElementById("cr7-events-body");
    var emptyMessage = document.getElementById("cr7-events-empty");

    var refreshBtn = document.getElementById("cr7-refresh");
    var demoBtn = document.getElementById("cr7-demo");
    var clearBtn = document.getElementById("cr7-clear");
    var downloadBtn = document.getElementById("cr7-download");

    function announce(message) {
      if (statusEl) statusEl.textContent = message;
    }

    function formatDetail(detail) {
      try {
        return JSON.stringify(detail);
      } catch (e) {
        return String(detail);
      }
    }

    function renderSession(session) {
      if (!sessionEl) return;
      sessionEl.innerHTML = "";

      if (!session || !session.updatedAt) {
        var emptyItem = document.createElement("p");
        emptyItem.textContent = "Aún no se ha capturado información de sesión.";
        sessionEl.appendChild(emptyItem);
        return;
      }

      var rows = [
        ["Actualizado", session.updatedAt],
        ["Página", session.page],
        ["Viewport", session.viewport ? session.viewport.width + " × " + session.viewport.height + " px (dpr " + session.viewport.devicePixelRatio + ")" : "N/D"],
        ["Conexión", session.connection ? (session.connection.effectiveType || "N/D") + (typeof session.connection.downlink === "number" ? " · " + session.connection.downlink + " Mbps" : "") + (typeof session.connection.rtt === "number" ? " · RTT " + session.connection.rtt + " ms" : "") : "API de conexión no disponible"],
        ["Idioma", session.language],
        ["Agente de usuario", session.userAgent]
      ];

      var dl = document.createElement("dl");
      dl.className = "cr7-session-list";

      rows.forEach(function (pair) {
        var dt = document.createElement("dt");
        dt.textContent = pair[0];
        var dd = document.createElement("dd");
        dd.textContent = pair[1] || "N/D";
        dl.appendChild(dt);
        dl.appendChild(dd);
      });

      sessionEl.appendChild(dl);

      if (session.apiSupport) {
        var apiTitle = document.createElement("p");
        apiTitle.className = "cr7-api-title";
        apiTitle.textContent = "Soporte de APIs:";
        sessionEl.appendChild(apiTitle);

        var list = document.createElement("ul");
        list.className = "cr7-api-list";
        Object.keys(session.apiSupport).forEach(function (key) {
          var li = document.createElement("li");
          var supported = session.apiSupport[key];
          li.textContent = key + ": " + (supported ? "disponible" : "no disponible");
          li.className = supported ? "cr7-api-yes" : "cr7-api-no";
          list.appendChild(li);
        });
        sessionEl.appendChild(list);
      }
    }

    function renderEvents(events) {
      if (!eventsBody) return;
      eventsBody.innerHTML = "";

      if (!events || events.length === 0) {
        if (emptyMessage) emptyMessage.hidden = false;
        return;
      }

      if (emptyMessage) emptyMessage.hidden = true;

      // Mostrar los más recientes primero.
      var ordered = events.slice().reverse();

      ordered.forEach(function (evt) {
        var tr = document.createElement("tr");

        var tsCell = document.createElement("td");
        tsCell.textContent = evt.ts;
        tr.appendChild(tsCell);

        var typeCell = document.createElement("td");
        typeCell.textContent = evt.type;
        tr.appendChild(typeCell);

        var pageCell = document.createElement("td");
        pageCell.textContent = evt.page;
        tr.appendChild(pageCell);

        var detailCell = document.createElement("td");
        detailCell.textContent = formatDetail(evt.detail);
        tr.appendChild(detailCell);

        eventsBody.appendChild(tr);
      });
    }

    function refresh(message) {
      var snapshot = window.CR7Observability.getSnapshot();

      if (generatedAtEl) generatedAtEl.textContent = snapshot.generatedAt;
      if (eventCountEl) eventCountEl.textContent = String(snapshot.events.length);
      if (storageStateEl) {
        storageStateEl.textContent = window.CR7Observability.isStorageAvailable()
          ? "localStorage disponible"
          : "localStorage no disponible (usando memoria temporal)";
      }

      renderSession(snapshot.session);
      renderEvents(snapshot.events);

      if (message) announce(message);
    }

    function downloadSnapshot() {
      var snapshot = window.CR7Observability.getSnapshot();
      var json = JSON.stringify(snapshot, null, 2);
      var blob = new Blob([json], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      var stamp = new Date().toISOString().replace(/[:.]/g, "-");

      link.href = url;
      link.download = "cr7-observability-snapshot-" + stamp + ".json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      announce("Snapshot descargado como archivo JSON.");
    }

    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        window.CR7Observability.captureSession();
        refresh("Datos actualizados.");
      });
    }

    if (demoBtn) {
      demoBtn.addEventListener("click", function () {
        window.CR7Observability.recordDemoEvent();
        refresh("Evento de demostración generado.");
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        window.CR7Observability.clearAll();
        window.CR7Observability.captureSession();
        refresh("Almacenamiento local limpiado.");
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", downloadSnapshot);
    }

    refresh("Panel listo.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupDashboard);
  } else {
    setupDashboard();
  }
})(window, document);
