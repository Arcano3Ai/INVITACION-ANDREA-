/**
 * Utilidades para agregar el evento al calendario (.ics + Google Calendar).
 */
(function (global) {
  'use strict';

  function getEventTargetYear() {
    const now = new Date();
    const year = now.getFullYear();
    const candidate = new Date(year, 10, 21, 18, 0, 0); // 21 de noviembre 6:00 PM
    return candidate.getTime() < now.getTime() - 86400000 ? year + 1 : year;
  }

  function formatICSDate(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return (
      date.getUTCFullYear() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) +
      'T' +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) +
      'Z'
    );
  }

  const EVENT_DETAILS = {
    title: 'Andrea — ¡Mis 2 Añitos! (Temática Minnie Mouse Rosa)',
    location:
      'Calle 16 de Agosto No. 101, esquina con Avenida Pablo Livas, Colonia Reserva de San Roque, Juárez, Nuevo León. PLANTA ALTA.',
    description:
      '¡Acompáñanos a celebrar el segundo cumpleaños de Andrea! Recepción: 6:00 PM | Show: 7:30 PM. Tu presencia es nuestro mejor regalo.'
  };

  function getEventDates() {
    const year = getEventTargetYear();
    const start = new Date(year, 10, 21, 18, 0, 0); // 6:00 PM
    const end = new Date(year, 10, 21, 22, 30, 0);  // 10:30 PM
    return { start, end };
  }

  function downloadICS() {
    const { start, end } = getEventDates();
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Invitacion Andrea//Mis 2 Anitos//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:andrea-2-anitos-${start.getFullYear()}@invitacion.local`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${EVENT_DETAILS.title}`,
      `LOCATION:${EVENT_DETAILS.location}`,
      `DESCRIPTION:${EVENT_DETAILS.description}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Andrea-Mis-2-Anitos.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function getGoogleCalendarUrl() {
    const { start, end } = getEventDates();
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: EVENT_DETAILS.title,
      dates: `${formatICSDate(start)}/${formatICSDate(end)}`,
      details: EVENT_DETAILS.description,
      location: EVENT_DETAILS.location
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  global.InvitationCalendar = {
    getEventDates,
    downloadICS,
    getGoogleCalendarUrl
  };
})(window);

