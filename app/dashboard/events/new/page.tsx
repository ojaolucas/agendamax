"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./new-event.module.css";
import MaterialsTable, { serializeMaterials, MaterialRow } from "@/components/MaterialsTable";

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [materialsValue, setMaterialsValue] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    // Inject the materials table value
    data.materials = materialsValue || "Nenhum material cadastrado";

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/dashboard/events");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Falha ao criar evento");
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Novo Evento</h1>
        <p>Preencha os dados para cadastrar um novo evento no sistema</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Nome do Evento</label>
            <input type="text" name="eventName" required placeholder="Ex: Show de Verão" />
          </div>

          <div className={styles.field}>
            <label>Cliente</label>
            <input type="text" name="clientName" required placeholder="Nome da empresa ou pessoa" />
          </div>

          <div className={styles.field}>
            <label>Contato do Cliente</label>
            <input type="text" name="clientContact" placeholder="(00) 00000-0000" />
          </div>

          <div className={styles.field}>
            <label>Local (Nome)</label>
            <input type="text" name="location" required placeholder="Ex: Centro de Convenções" />
          </div>

          <div className={styles.field}>
            <label>Endereço Completo</label>
            <input type="text" name="address" placeholder="Rua, Número, Bairro, Cidade" />
          </div>

          <div className={styles.field}>
            <label>Tipo de Evento</label>
            <select name="eventType" required>
              <option value="">Selecione...</option>
              <option value="Show">Show</option>
              <option value="Corporativo">Corporativo</option>
              <option value="Festa">Festa</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Data e Hora de Início</label>
            <input type="datetime-local" name="startDatetime" required />
          </div>

          <div className={styles.field}>
            <label>Data e Hora de Término</label>
            <input type="datetime-local" name="endDatetime" required />
          </div>

          <div className={styles.field}>
            <label>Data e Hora de Montagem (Setup)</label>
            <input type="datetime-local" name="setupDatetime" required />
          </div>

          <div className={styles.field}>
            <label>Data e Hora de Desmontagem (Teardown)</label>
            <input type="datetime-local" name="teardownDatetime" required />
          </div>
        </div>

        <div className={styles.field}>
          <label>Equipamentos e Materiais</label>
          <MaterialsTable onChange={setMaterialsValue} />
        </div>

        <div className={styles.field}>
          <label>Descrição do Evento</label>
          <textarea name="description" rows={3} placeholder="Informações adicionais..."></textarea>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button type="button" onClick={() => router.back()} className={styles.cancelBtn}>
            Cancelar
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Salvando..." : "Criar Evento"}
          </button>
        </div>
      </form>
    </div>
  );
}
