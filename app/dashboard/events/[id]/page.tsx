import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import styles from "./details.module.css";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      AuditLog: {
        include: { user: true },
        orderBy: { timestamp: "desc" },
      },
    },
  });

  if (!event) notFound();

  const canEdit = session?.user.role !== "LOGISTICS";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <Link href="/dashboard/events" className={styles.backLink}>← Voltar</Link>
          <h1>{event.eventName}</h1>
          <span className={`${styles.statusBadge} ${styles[event.status.toLowerCase()]}`}>
            {event.status}
          </span>
        </div>
        {canEdit && (
          <Link href={`/dashboard/events/${id}/edit`} className={styles.editBtn}>
            Editar Evento
          </Link>
        )}
      </header>

      <div className={styles.contentGrid}>
        <div className={styles.mainInfo}>
          <section className={styles.card}>
            <h2>Informações Gerais</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Cliente</label>
                <p>{event.clientName}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Contato Cliente</label>
                <p>{event.clientContact || "Não informado"}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Local</label>
                <p>{event.location}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Endereço</label>
                <p>{event.address || "Não informado"}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Tipo</label>
                <p>{event.eventType}</p>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2>Cronograma</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Início</label>
                <p>{format(new Date(event.startDatetime), "PPpp", { locale: ptBR })}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Término</label>
                <p>{format(new Date(event.endDatetime), "PPpp", { locale: ptBR })}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Montagem (Setup)</label>
                <p>{format(new Date(event.setupDatetime), "PPpp", { locale: ptBR })}</p>
              </div>
              <div className={styles.infoItem}>
                <label>Desmontagem (Teardown)</label>
                <p>{format(new Date(event.teardownDatetime), "PPpp", { locale: ptBR })}</p>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2>Materiais e Estrutura</h2>
            <p className={styles.textBlock}>{event.materials}</p>
          </section>

          <section className={styles.card}>
            <h2>Descrição</h2>
            <p className={styles.textBlock}>{event.description || "Sem descrição adicional."}</p>
          </section>

          <div className={styles.actions}>
             <Link href={`/dashboard/events/${id}/delivery-term`} className={styles.secondaryBtn}>
                Gerar Termo de Entrega
             </Link>
          </div>
        </div>

        <aside className={styles.auditLog}>
          <h2>Histórico de Alterações</h2>
          <div className={styles.logList}>
            {event.AuditLog.length === 0 ? (
              <p className={styles.emptyLog}>Nenhuma alteração registrada.</p>
            ) : (
              event.AuditLog.map((log) => (
                <div key={log.id} className={styles.logItem}>
                  <div className={styles.logHeader}>
                    <strong>{log.user.name}</strong>
                    <span>{format(new Date(log.timestamp), "dd/MM HH:mm")}</span>
                  </div>
                  <div className={styles.logBody}>
                    <p>Campo: <code>{log.field}</code></p>
                    <div className={styles.logValues}>
                      <span className={styles.oldVal}>{log.previousValue || "vazio"}</span>
                      <span className={styles.arrow}>→</span>
                      <span className={styles.newVal}>{log.newValue}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
