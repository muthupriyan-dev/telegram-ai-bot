// utils/dateTime.js
// Real clock, recomputed on every call — never hardcoded, never guessed by the LLM.

function getNow() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const parts = fmt.formatToParts(now);
  const get = (type) => parts.find(p => p.type === type)?.value;

  return {
    day: get('weekday'),                 // "Saturday"
    date: `${get('day')} ${get('month')} ${get('year')}`,
    time: `${get('hour')}:${get('minute')} ${get('dayPeriod')}`,
    humanReadable: fmt.format(now).replace(',', ' —'),
  };
}

function isDateTimeQuestion(text) {
  const t = text.toLowerCase();
  return /(what.*(day|date|time).*(today|now|is it))|(today.*date)|(current (time|date|day))|(what day is (it|today))|(inniku enna (dhinam|naal|date))/i.test(t);
}

function answerDateTimeQuestion(text) {
  const { day, time, humanReadable } = getNow();
  const t = text.toLowerCase();
  if (/time/.test(t) && !/day|date/.test(t)) return `Ippo time ${time} (IST) 🕐`;
  if (/day/.test(t) && !/date|time/.test(t)) return `Today is ${day}! 📅`;
  return `${humanReadable} (IST) — so it's a ${day} today.`;
}

module.exports = { getNow, isDateTimeQuestion, answerDateTimeQuestion };
