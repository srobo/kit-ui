export const settings = {
  theme: {
    default: "auto",
    value: undefined,
    apply: (value) => {
      document.body.classList.remove("theme-dark", "theme-light");
      if (value !== "auto") {
        document.body.classList.add(`theme-${value}`);
      }
    },
  },
  scrollbackLimit: {
    default: 10_000,
    load: (value) => parseInt(value, 10),
    value: undefined,
    apply: (value) => {
      const scrollbackLimit = parseInt(value, 10);
      if (scrollbackLimit !== -1) {
        const log = document.getElementById("log");
        // Remove the first scrollbackLimit lines
        const lines = log.querySelectorAll(".log-entry");
        const linesToRemove = lines.length - scrollbackLimit;
        for (let i = 0; i < linesToRemove; i++) {
          log.removeChild(lines[i]);
        }
      }
    },
  },
  wrapLines: {
    default: true,
    load: (value) => value === "true",
    value: true,
    apply: (value) => {
      console.log(value);
      if (!value) {
        document.body.classList.add("no-wrap");
      } else {
        document.body.classList.remove("no-wrap");
      }
    }
  }
};

const noop = (v) => v;

export function loadSettings() {
  for (const key in settings) {
    const setting = settings[key];
    const value = localStorage.getItem(key);
    const load = setting.load || noop;
    setting.value = value !== null ? load(value) : setting.default;
    setting.apply(setting.value);

    const el = document.querySelector(`[data-setting="${key}"]`);
    if (el.getAttribute('type') === 'checkbox') {
      el.checked = setting.value;
    } else {
      el.value = setting.value;
    }
    el.addEventListener(
      "change",
      (e) => {
        const isCheckbox = e.target.getAttribute('type') === 'checkbox';
        const newValue = isCheckbox ? e.target.checked : e.target.value;
        setting.value = newValue;
        setting.apply(newValue);
        localStorage.setItem(key, newValue);
      },
      { passive: true },
    );
  }
}
