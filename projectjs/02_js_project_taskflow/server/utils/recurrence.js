// Computes the next due date for a recurring task, given the date it's
// recurring FROM (usually the just-completed task's dueDate) and its
// recurrence rule. Returns a Date, or null if the rule is incomplete/invalid
// (e.g. weekly/custom with no daysOfWeek specified).
//
// This is a pure function on purpose — no DB access — so the date math can
// be unit tested directly instead of only through a full controller flow.
function getNextOccurrence(fromDate, recurrence) {
  if (!recurrence || recurrence.type === 'none') return null;

  const { type, interval = 1, daysOfWeek = [] } = recurrence;
  const safeInterval = Number.isInteger(interval) && interval > 0 ? interval : 1;
  const base = fromDate ? new Date(fromDate) : new Date();

  if (type === 'daily') {
    const next = new Date(base);
    next.setDate(next.getDate() + safeInterval);
    return next;
  }

  if (type === 'monthly') {
    const day = base.getDate();
    const next = new Date(base);
    next.setDate(1); // pin to day 1 first so setMonth can't skip a month on overflow
    next.setMonth(next.getMonth() + safeInterval);
    const daysInTargetMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
    next.setDate(Math.min(day, daysInTargetMonth)); // e.g. Jan 31 -> Feb 28/29
    return next;
  }

  if (type === 'weekly' || type === 'custom') {
    if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      // 'custom' without explicit days isn't a valid rule; plain 'weekly'
      // without days just means "every N weeks on the same weekday".
      if (type === 'custom') return null;
      const next = new Date(base);
      next.setDate(next.getDate() + safeInterval * 7);
      return next;
    }

    const validDays = new Set(daysOfWeek.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6));
    if (validDays.size === 0) return null;

    // Walk forward day-by-day (capped well beyond any interval*week span)
    // until we land on one of the configured weekdays.
    const next = new Date(base);
    const maxLookahead = safeInterval * 7 + 7;
    for (let i = 1; i <= maxLookahead; i++) {
      next.setDate(base.getDate() + i);
      if (validDays.has(next.getDay())) {
        return next;
      }
    }
    return null;
  }

  return null;
}

module.exports = { getNextOccurrence };
