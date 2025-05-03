import { settings } from "./settings.mjs";

const logMessageRegex = /\[(\d+:\d{2}:\d{2}\.?\d*)] (.*)/;
const $log = document.getElementById("log");
const $template = document.getElementById("tpl-log-entry");
let _shouldAutoScroll = true;
let _generatedScrollEvent = false;

function checkScrollbackLimit() {
  if (settings.scrollbackLimit.value !== -1 && $log.childElementCount > settings.scrollbackLimit.value) {
    $log.firstElementChild.remove();
  }
}

export function createPlainLogEntry(text, icon = null, icon_class = null, ...classes) {
  checkScrollbackLimit();
  const entry = document.createElement("div");
  entry.classList.add("plain-log-entry", ...classes);
  entry.textContent = text;

  if (icon) {
    const iconElement = document.createElement("span");
    iconElement.classList.add("material-symbols-outlined");
    icon_class && iconElement.classList.add(icon_class);
    iconElement.textContent = icon;
    entry.prepend(iconElement);
  }

  $log.appendChild(entry);

  if (_shouldAutoScroll) {
    _generatedScrollEvent = true;
    entry.scrollIntoView();
  }

  return entry;
}

export function createUsercodeLogEntry(contents) {
  checkScrollbackLimit();
  const entryFragment = $template.content.cloneNode(true);
  const [_, ts, message] = contents.content.match(logMessageRegex);

  entryFragment.querySelector(".log-entry").dataset.source = contents.source;
  entryFragment.querySelector(".log-entry__ts").textContent = ts;
  const contentEl = entryFragment.querySelector(".log-entry__content");
  contentEl.innerText = message.replaceAll(" ", String.fromCharCode(0xa0));

  if (contents.source === "astoria") {
    contentEl.classList.add(
      "has-text-weight-bold",
      "has-text-centered",
      "is-family-sans-serif",
    );
  } else if (contents.source === "stderr") {
    contentEl.classList.add("has-text-danger");
  } else if (message.indexOf("WARNING:") === 0) {
    contentEl.classList.add("has-text-warning");
  }

  $log.appendChild(entryFragment);
  _generatedScrollEvent = true;
  if (_shouldAutoScroll) contentEl.scrollIntoView({ block: "end" });
}

export function initLog() {
  $log.addEventListener(
    "scroll",
    function (e) {
      if (_generatedScrollEvent) {
        _generatedScrollEvent = false;
      } else {
        _shouldAutoScroll = false;
        e.target.dataset.autoscroll = "false";
      }
    },
    {
      passive: true,
    },
  );

  document.getElementById("scroll-to-bottom").addEventListener("click", function (e) {
    _shouldAutoScroll = true;
    _generatedScrollEvent = true;
    $log.dataset.autoscroll = "true";
    $log.scrollTop = $log.scrollHeight;
  });
}

export function clearLog() {
  document.querySelectorAll('.log-entry, .plain-log-entry').forEach((el) => {
    el.remove();
  });
}