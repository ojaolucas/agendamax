import { prisma } from "@/lib/prisma";
import Link from "next/link";
import styles from "./events.module.css";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getSession } from "@/lib/auth";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; client?: string; q?: string }>;
}) {
  const session = await getSession();
  const canEdit = session?.user.role !== "LOGISTICS";
  const params = await searchParams;

  const events = await prisma.event.findMany({
    where: {
      AND: [
        params.status ? { status: params.status as any } : {},
        params.client ? { clientName: { contains: params.client } } : {},
        params.q ? { eventName: { contains: params.q } } : {},
      ],
    },
    orderBy: { startDatetime: "desc" },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Eventos</h1>
          <p>Gerencie todos os eventos cadastrados</p>
        </div>
        {canEdit && (
          <Link href="/dashboard/events/new" className={styles.addButton}>
            + Novo Evento
          </Link>
        )}
      </header>

      <div className={styles.filters}>
        {/* Simplified filter bar for now */}
        <form className={styles.filterForm}>
          <input type="text" name="q" placeholder="Buscar por nome..." defaultValue={params.q} />
          <select name="status" defaultValue={params.status}>
            <option value="">Todos os Status</option>
            <option value="PLANNING">Planejamento</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="FINISHED">Finalizado</option>
          </select>
          <button type="submit">Filtrar</button>
        </form>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Evento</th>
              <th>Cliente</th>
              <th>Data Início</th>
              <th>Local</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.noData}>Nenhum evento encontrado</td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id}>
                  <td><strong>{event.eventName}</strong></td>
                  <td>{event.clientName}</td>
                  <td>{format(new Date(event.startDatetime), "dd/MM/yyyy HH:mm")}</td>
                  <td>{event.location}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[event.status.toLowerCase()]}`}>
                      {event.status === "PLANNING" ? "Planejamento" :
                       event.status === "CONFIRMED" ? "Confirmado" :
                       event.status === "IN_PROGRESS" ? "Em Andamento" : "Finalizado"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/dashboard/events/${event.id}`} className={styles.viewLink}>Ver</Link>
                      {canEdit && (
                        <Link href={`/dashboard/events/${event.id}/edit`} className={styles.editLink}>Editar</Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
