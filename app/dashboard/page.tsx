import { prisma } from "@/lib/prisma";
import styles from "./dashboard.module.css";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { 
  IconUsers, 
  IconCalendar, 
  IconEvents, 
  IconReports, 
  IconPlus, 
  IconCheck, 
  IconAlert, 
  IconX 
} from "@/components/Icons";

export default async function DashboardPage() {
  const session = await getSession();
  const now = new Date();
  
  const confirmedCount = await prisma.event.count({ where: { status: "CONFIRMED" } });
  const inProgressCount = await prisma.event.count({ where: { status: "IN_PROGRESS" } });
  const planningCount = await prisma.event.count({ where: { status: "PLANNING" } });
  const totalCount = await prisma.event.count();

  const alerts = await prisma.event.findMany({
    where: {
      OR: [
        { setupDatetime: { gte: now, lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) } },
        { teardownDatetime: { gte: now, lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) } }
      ]
    },
    orderBy: { setupDatetime: "asc" },
  });

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1>Dashboard</h1>
        <p>Visão geral da gestão de eventos e estruturas</p>
      </section>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.cardHeader}>
            <span>Padrão Locações</span>
            <IconUsers size={18} />
          </div>
          <div className={styles.cardValue}>{planningCount}</div>
          <span className={styles.cardLabel}>eventos em planejamento</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.cardHeader}>
            <span>Confirmados</span>
            <IconCalendar size={18} />
          </div>
          <div className={styles.cardValue}>{confirmedCount}</div>
          <span className={styles.cardLabel}>eventos confirmados</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.cardHeader}>
            <span>Em Andamento</span>
            <IconEvents size={18} />
          </div>
          <div className={styles.cardValue}>{inProgressCount}</div>
          <span className={styles.cardLabel}>eventos ocorrendo agora</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.cardHeader}>
            <span>Total Geral</span>
            <IconReports size={18} />
          </div>
          <div className={styles.cardValue}>{totalCount}</div>
          <span className={styles.cardLabel}>eventos cadastrados</span>
        </div>
      </div>

      <div className={styles.alertsGrid}>
        <div className={`${styles.alertCard} ${styles.green}`}>
           <div className={styles.alertHeader}>
              <span>Eventos em Dia</span>
              <IconCheck />
           </div>
           <div className={styles.alertValue}>{confirmedCount}</div>
        </div>
        <div className={`${styles.alertCard} ${styles.yellow}`}>
           <div className={styles.alertHeader}>
              <span>Setup Próximo</span>
              <IconAlert />
           </div>
           <div className={styles.alertValue}>{alerts.filter(a => a.setupDatetime >= now).length}</div>
           <span className={styles.alertLabel}>próximas 24 horas</span>
        </div>
        <div className={`${styles.alertCard} ${styles.red}`}>
           <div className={styles.alertHeader}>
              <span>Teardown Próximo</span>
              <IconX />
           </div>
           <div className={styles.alertValue}>{alerts.filter(a => a.teardownDatetime >= now).length}</div>
           <span className={styles.alertLabel}>requer atenção urgente</span>
        </div>
      </div>

      <div className={styles.actionsGrid}>
        <Link href="/dashboard/events/new" className={styles.actionCard}>
           <div className={styles.actionIcon}>
              <IconPlus />
           </div>
           <div>
              <strong>Novo Evento</strong>
              <span>Cadastrar novo evento no sistema</span>
           </div>
        </Link>
        <Link href="/dashboard/reports" className={styles.actionCard}>
           <div className={styles.actionIcon}>
              <IconReports />
           </div>
           <div>
              <strong>Ver Relatórios</strong>
              <span>Gerar documentos e PDFs</span>
           </div>
        </Link>
      </div>
    </div>
  );
}
