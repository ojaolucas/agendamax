import { prisma } from "@/lib/prisma";
import styles from "./reports.module.css";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import PrintReportButton from "./PrintReportButton";
import { processTemplate } from "@/lib/templates";

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

  const settings = await prisma.companySettings.findUnique({
    where: { id: "settings" },
  });

  // Generate the content string for the template
  const eventsHtml = events.map(event => `
    <div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
      <h3 style="margin: 0;">${event.eventName}</h3>
      <p style="margin: 5px 0;"><strong>Data:</strong> ${format(new Date(event.startDatetime), "dd/MM HH:mm")}</p>
      <p style="margin: 5px 0;"><strong>Cliente:</strong> ${event.clientName}</p>
      <p style="margin: 5px 0;"><strong>Local:</strong> ${event.location}</p>
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px; margin-top: 10px;">
        <strong>Materiais:</strong>
        <p style="white-space: pre-wrap; margin: 5px 0;">${event.materials}</p>
      </div>
    </div>
  `).join("");

  const templateData = {
    period: `${format(startDate, "dd/MM/yyyy")} a ${format(endDate, "dd/MM/yyyy")}`,
    content: eventsHtml,
    companyName: settings?.companyName || "agendaMAX",
  };

  const htmlContent = processTemplate(
    settings?.reportTemplate || "<h1>RELATÓRIO DE EVENTOS</h1><p>Período: {{period}}</p><div>{{content}}</div>",
    templateData
  );

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
        <header className={styles.docHeader}>
          {settings?.logo && <img src={settings.logo} alt="Logo" className={styles.logo} />}
          <div className={styles.companyInfo}>
            <h2>{settings?.companyName}</h2>
            <p>{settings?.address}</p>
            <p>{settings?.phone} | {settings?.email}</p>
          </div>
        </header>

        <div 
          className={styles.dynamicContent}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}
