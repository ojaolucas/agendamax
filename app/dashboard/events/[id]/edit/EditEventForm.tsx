"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../new/new-event.module.css"; // Reuse styles

export default function EditEventForm({ event }: { event: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push(`/dashboard/events/${event.id}`);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Falha ao atualizar evento");
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateStr: string) => {
    return new Date(dateStr).toISOString().slice(0, 16);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Editar Evento</h1>
        <p>Atualize as informações do evento e registre as mudanças no log</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Nome do Evento</label>
            <input type="text" name="eventName" defaultValue={event.eventName} required />
          </div>

          <div className={styles.field}>
            <label>Cliente</label>
            <input type="text" name="clientName" defaultValue={event.clientName} required />
          </div>

          <div className={styles.field}>
            <label>Contato do Cliente</label>
            <input type="text" name="clientContact" defaultValue={event.clientContact || ""} placeholder="(00) 00000-0000" />
          </div>

          <div className={styles.field}>
            <label>Local (Nome)</label>
            <input type="text" name="location" defaultValue={event.location} required />
          </div>

          <div className={styles.field}>
            <label>Endereço Completo</label>
            <input type="text" name="address" defaultValue={event.address || ""} placeholder="Rua, Número, Bairro, Cidade" />
          </div>

          <div className={styles.field}>
            <label>Tipo de Evento</label>
            <select name="eventType" defaultValue={event.eventType} required>
              <option value="Show">Show</option>
              <option value="Corporativo">Corporativo</option>
              <option value="Festa">Festa</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Status</label>
            <select name="status" defaultValue={event.status} required>
              <option value="PLANNING">Planejamento</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="FINISHED">Finalizado</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Data e Hora de Início</label>
            <input type="datetime-local" name="startDatetime" defaultValue={formatDateForInput(event.startDatetime)} required />
          </div>

          <div className={styles.field}>
            <label>Data e Hora de Término</label>
            <input type="datetime-local" name="endDatetime" defaultValue={formatDateForInput(event.endDatetime)} required />
          </div>

          <div className={styles.field}>
            <label>Data e Hora de Montagem (Setup)</label>
            <input type="datetime-local" name="setupDatetime" defaultValue={formatDateForInput(event.setupDatetime)} required />
          </div>

          <div className={styles.field}>
            <label>Data e Hora de Desmontagem (Teardown)</label>
            <input type="datetime-local" name="teardownDatetime" defaultValue={formatDateForInput(event.teardownDatetime)} required />
          </div>
        </div>

        <div className={styles.field}>
          <label>Materiais (Descrição detalhada da estrutura)</label>
          <textarea name="materials" rows={5} defaultValue={event.materials} required></textarea>
        </div>

        <div className={styles.field}>
          <label>Descrição do Evento</label>
          <textarea name="description" rows={3} defaultValue={event.description}></textarea>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button type="button" onClick={() => router.back()} className={styles.cancelBtn}>
            Cancelar
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
