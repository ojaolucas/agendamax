import { prisma } from "@/lib/prisma";
import styles from "./calendar.module.css";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const month = params.month ? parseInt(params.month) : now.getMonth();
  const year = params.year ? parseInt(params.year) : now.getFullYear();

  const currentMonth = new Date(year, month, 1);
  const startOfCalendar = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
  const endOfCalendar = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startOfCalendar, end: endOfCalendar });

  const events = await prisma.event.findMany({
    where: {
      startDatetime: {
        gte: startOfCalendar,
        lte: endOfCalendar,
      },
    },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Calendário</h1>
        <div className={styles.controls}>
          <Link href={`/dashboard/calendar?month=${month === 0 ? 11 : month - 1}&year=${month === 0 ? year - 1 : year}`} className={styles.navBtn}>Anterior</Link>
          <h2>{format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}</h2>
          <Link href={`/dashboard/calendar?month=${month === 11 ? 0 : month + 1}&year=${month === 11 ? year + 1 : year}`} className={styles.navBtn}>Próximo</Link>
        </div>
      </header>

      <div className={styles.calendarGrid}>
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div key={day} className={styles.dayHeader}>{day}</div>
        ))}
        {days.map((day) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.startDatetime), day));
          return (
            <div key={day.toISOString()} className={`${styles.day} ${day.getMonth() !== month ? styles.otherMonth : ""}`}>
              <span className={styles.dayNumber}>{format(day, "d")}</span>
              <div className={styles.eventDots}>
                {dayEvents.map((event) => (
                  <Link 
                    key={event.id} 
                    href={`/dashboard/events/${event.id}`}
                    className={`${styles.eventDot} ${styles[event.status.toLowerCase()]}`}
                    title={event.eventName}
                  >
                    {event.eventName}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import Link from "next/link";
