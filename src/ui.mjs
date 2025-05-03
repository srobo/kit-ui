function initModals() {
  // Add a click event on modal triggers
  document.querySelectorAll(".modal-trigger").forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener("click", () => {
      $target.classList.add("is-active");
    });
  });

  // Add a click event on various child elements to close the parent modal
  document
    .querySelectorAll(
      ".modal-background-close, .modal-close, .modal-card-head .delete, .modal-card-foot .button",
    )
    .forEach(($close) => {
      const $target = $close.closest(".modal");
      if (!$target) return;
      $close.addEventListener("click", () => {
        $target.classList.remove("is-active");
      });
    });
}

function initSettingsTabs() {
  document.getElementById('settings-tab-strip').querySelectorAll('a').forEach((tab) => {
    const target = tab.dataset.target;
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.settings-tab').forEach((content) => {
        content.classList.add('is-hidden');
      });
      document.getElementById(`settings-${target}`).classList.remove('is-hidden');
      document.querySelector('#settings-tab-strip li.is-active').classList.remove('is-active');
      tab.parentElement.classList.add('is-active');
    }, { passive: true });
  });
}

export default function() {
  initModals();
  initSettingsTabs();
}
