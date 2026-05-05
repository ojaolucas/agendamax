"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./new-user.module.css";

export default function NewUserPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    password: "",
    role: "LOGISTICS",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (data.success) {
      router.push("/dashboard/users");
      router.refresh();
    } else {
      setError(data.error);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/dashboard/users" className={styles.backLink}>← Voltar</Link>
        <h1>Novo Usuário</h1>
        <p>Cadastre um novo colaborador no sistema</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Nome Completo</label>
            <input 
              type="text" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: João Silva"
            />
          </div>
          <div className={styles.field}>
            <label>E-mail</label>
            <input 
              type="email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="joao@exemplo.com"
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
              placeholder="00000000000"
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
            <label>Senha Provisória</label>
            <input 
              type="password" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="********"
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar Usuário"}
          </button>
        </div>
      </form>
    </div>
  );
}
