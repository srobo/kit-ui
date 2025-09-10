import { settings } from "./settings.js";

const logMessageRegex = /\[(\d+:\d{2}:\d{2}\.?\d*)] (.*)/;
const $log = document.getElementById("log");
const $template = document.getElementById("tpl-log-entry");
let shouldAutoScroll = true;
let generatedScrollEvent = false;

function checkScrollbackLimit() {
  if (
    settings.scrollbackLimit.value !== -1 &&
    $log.childElementCount >= settings.scrollbackLimit.value
  ) {
    const scrollbackLimit = settings.scrollbackLimit.value;
    const scrollbackCount = $log.childElementCount - scrollbackLimit;
    for (let i = 0; i <= scrollbackCount; i++) {
      $log.firstElementChild.remove();
    }
  }
}

export function createPlainLogEntry(
  text,
  icon = null,
  icon_class = null,
  ...classes
) {
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

  if (shouldAutoScroll) {
    generatedScrollEvent = true;
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
  generatedScrollEvent = true;
  if (shouldAutoScroll) contentEl.parentElement.scrollIntoView({ block: "end" });
}

export function initLog() {
  $log.addEventListener(
    "scroll",
    function (e) {
      if (generatedScrollEvent) {
        generatedScrollEvent = false;
      } else {
        shouldAutoScroll = false;
        e.target.dataset.autoscroll = "false";
      }
    },
    {
      passive: true,
    },
  );

  document
    .getElementById("scroll-to-bottom")
    .addEventListener("click", function (e) {
      shouldAutoScroll = true;
      generatedScrollEvent = true;
      $log.dataset.autoscroll = "true";
      $log.scrollTop = $log.scrollHeight;
    });
}

export function clearLog() {
  document.querySelectorAll(".log-entry, .plain-log-entry").forEach((el) => {
    el.remove();
  });
}
