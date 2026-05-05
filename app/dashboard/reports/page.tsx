import { prisma } from "@/lib/prisma";
import styles from "./reports.module.css";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import PrintReportButton from "./PrintReportButton";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const startDate = params.start ? startOfDay(new Date(params.start)) : startOfDay(new Date());
  const endDate = params.end ? endOfDay(new Date(params.end)) : endOfDay(new Date());

  const events = await prisma.event.findMany({
    where: {
      startDatetime: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { startDatetime: "asc" },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Relatórios</h1>
        <p>Gere resumos de eventos e materiais para períodos específicos</p>
      </header>

      <div className={styles.filterBar}>
        <form className={styles.filterForm}>
          <div className={styles.field}>
            <label>Início</label>
            <input type="date" name="start" defaultValue={params.start || format(new Date(), "yyyy-MM-dd")} />
          </div>
          <div className={styles.field}>
            <label>Fim</label>
            <input type="date" name="end" defaultValue={params.end || format(new Date(), "yyyy-MM-dd")} />
          </div>
          <button type="submit" className={styles.generateBtn}>Gerar Relatório</button>
          <PrintReportButton />
        </form>
      </div>

      <div className={styles.reportContent}>
        <div className={styles.reportHeader}>
          <h2>Relatório de Eventos</h2>
          <p>Período: {format(startDate, "dd/MM/yyyy")} a {format(endDate, "dd/MM/yyyy")}</p>
        </div>

        {events.length === 0 ? (
          <p className={styles.empty}>Nenhum evento encontrado para este período.</p>
        ) : (
          <div className={styles.eventList}>
            {events.map((event) => (
              <div key={event.id} className={styles.reportItem}>
                <div className={styles.itemHeader}>
                  <h3>{event.eventName}</h3>
                  <span>{format(new Date(event.startDatetime), "dd/MM HH:mm")}</span>
                </div>
                <div className={styles.itemDetails}>
                  <p><strong>Cliente:</strong> {event.clientName}</p>
                  <p><strong>Local:</strong> {event.location}</p>
                  <div className={styles.materialsSection}>
                    <strong>Materiais:</strong>
                    <p>{event.materials}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
