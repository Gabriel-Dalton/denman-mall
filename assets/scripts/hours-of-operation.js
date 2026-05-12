document.addEventListener('DOMContentLoaded', () => {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const today = days[new Date().getDay()];

  const hoursList = document.querySelector('#hours-section [data-hours-list]');
  if (!hoursList) {
    console.warn('[HoursOfOperation] Hours list not found. Script loaded but no target element present.');
    return;
  }

  let highlighted = false;

  hoursList.querySelectorAll('p').forEach(row => {
    const day = row.textContent.split(':')[0].trim();
    const isToday = day === today;

    row.classList.toggle('font-bold', isToday);
    row.classList.toggle('text-white', isToday);

    if (isToday) highlighted = true;
  });

  if (highlighted) {
    console.info(`[HoursOfOperation] Active day highlighted: ${today}`);
  } else {
    console.warn('[HoursOfOperation] Script ran, but no matching day was found to highlight.');
  }
});