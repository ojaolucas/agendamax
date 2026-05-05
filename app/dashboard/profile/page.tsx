"use client";

import { useState, useEffect } from "react";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [image, setImage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetch("/api/user/profile")
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setName(data.name);
        setEmail(data.email);
        setCpf(data.cpf);
        setImage(data.image || "");
        setLoading(false);
      });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, cpf, image }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
      setTimeout(() => window.location.reload(), 1000); // Refresh to update layout avatar
    } else {
      setMessage({ type: "error", text: data.error });
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem" });
      return;
    }
    setSaving(true);
    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage({ type: "success", text: "Senha alterada com sucesso!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setMessage({ type: "error", text: data.error });
    }
    setSaving(false);
  };

  if (loading) return <div className={styles.loading}>Carregando...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Meu Perfil</h1>
        <p>Gerencie todas as suas informações pessoais e segurança</p>
      </header>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Informações da Conta</h2>
          <form onSubmit={handleUpdateProfile} className={styles.form}>
            <div className={styles.avatarSection}>
              <div className={styles.avatarPreview}>
                {image ? <img src={image} alt="Profile" /> : <span>{name?.charAt(0)}</span>}
              </div>
              <label className={styles.uploadBtn}>
                Alterar Foto
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
              </label>
            </div>

            <div className={styles.field}>
              <label>Nome Completo</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>

            <div className={styles.field}>
              <label>CPF (apenas números)</label>
              <input 
                type="text" 
                value={cpf} 
                onChange={(e) => setCpf(e.target.value)} 
                maxLength={11} 
                required 
              />
            </div>

            <div className={styles.field}>
              <label>E-mail</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className={styles.field}>
              <label>Cargo (Permissão)</label>
              <input type="text" value={user.role} disabled />
              <small>O cargo só pode ser alterado por um gestor.</small>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </form>
        </section>

        <section className={styles.card}>
          <h2>Segurança</h2>
          <form onSubmit={handleChangePassword} className={styles.form}>
            <p className={styles.hint}>Para alterar sua senha, preencha os campos abaixo.</p>
            
            <div className={styles.field}>
              <label>Senha Atual</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>

            <div className={styles.field}>
              <label>Nova Senha</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>

            <div className={styles.field}>
              <label>Confirmar Nova Senha</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? "Alterando..." : "Alterar Senha"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
