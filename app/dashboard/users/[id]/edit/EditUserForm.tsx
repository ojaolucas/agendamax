"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../new/new-user.module.css";

export default function EditUserForm({ user }: { user: any }) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    cpf: user.cpf,
    role: user.role,
    active: user.active,
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (data.success) {
      setSuccess("Usuário atualizado com sucesso!");
      router.refresh();
      setTimeout(() => router.push("/dashboard/users"), 1500);
    } else {
      setError(data.error);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/dashboard/users" className={styles.backLink}>← Voltar</Link>
        <h1>Editar Usuário</h1>
        <p>Atualize as informações de {user.name}</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#34d399", padding: "1rem", borderRadius: "12px", textAlign: "center", marginBottom: "1rem" }}>{success}</div>}
        
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Nome Completo</label>
            <input 
              type="text" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className={styles.field}>
            <label>E-mail</label>
            <input 
              type="email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className={styles.field}>
            <label>CPF (apenas números)</label>
            <input 
              type="text" 
              required 
              maxLength={11}
              value={formData.cpf}
              onChange={(e) => setFormData({...formData, cpf: e.target.value})}
            />
          </div>
          <div className={styles.field}>
            <label>Cargo / Permissão</label>
            <select 
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="LOGISTICS">Logística (Visualização)</option>
              <option value="ADMINISTRATIVE">Administrativo (Edição)</option>
              <option value="MANAGER">Gestor (Acesso Total)</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Nova Senha (deixe em branco para não alterar)</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="********"
            />
          </div>
          <div className={styles.field}>
            <label>Status da Conta</label>
            <select 
              value={formData.active ? "true" : "false"}
              onChange={(e) => setFormData({...formData, active: e.target.value === "true"})}
            >
              <option value="true">Ativa</option>
              <option value="false">Desativada</option>
            </select>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
