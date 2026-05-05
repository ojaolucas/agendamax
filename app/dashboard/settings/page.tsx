"use client";

import { useState, useEffect } from "react";
import styles from "./settings.module.css";
import { IconEvents, IconReports, IconUser } from "@/components/Icons";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Configurações salvas com sucesso!" });
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao conectar ao servidor" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.container}>Carregando...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Personalização</h1>
        <p>Configure a identidade visual e os modelos de documentos da empresa</p>
      </header>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className={styles.grid}>
        <div className={styles.leftColumn}>
          <section className={styles.card}>
            <h2><IconUser size={20} /> Identidade Visual</h2>
            <div className={styles.logoSection}>
              <div className={styles.logoPreview}>
                {settings.logo ? <img src={settings.logo} alt="Logo" /> : <span>Sem Logo</span>}
              </div>
              <label className={styles.uploadBtn}>
                Upload Logo
                <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
              </label>
            </div>

            <div className={styles.form}>
              <div className={styles.field}>
                <label>Nome da Empresa</label>
                <input 
                  type="text" 
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  required 
                />
              </div>
              <div className={styles.field}>
                <label>E-mail de Contato</label>
                <input 
                  type="email" 
                  value={settings.email || ""}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Telefone</label>
                <input 
                  type="text" 
                  value={settings.phone || ""}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>
              <div className={styles.field}>
                <label>Endereço</label>
                <textarea 
                  rows={3}
                  value={settings.address || ""}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </div>
            </div>
          </section>
          
          <button type="submit" className={styles.submitBtn} disabled={saving} style={{ width: "100%", marginTop: "1rem" }}>
            {saving ? "Salvando..." : "Salvar Todas as Alterações"}
          </button>
        </div>

        <div className={styles.rightColumn}>
          <section className={styles.card}>
            <h2><IconEvents size={20} /> Modelo: Termo de Entrega</h2>
            <div className={styles.field}>
              <label>Estrutura HTML do Documento</label>
              <textarea 
                rows={10}
                value={settings.deliveryTemplate || ""}
                onChange={(e) => setSettings({ ...settings, deliveryTemplate: e.target.value })}
              />
              <div className={styles.placeholders}>
                Variáveis (use <code>{"{{ }}"}</code> ou <code>{"<< >>"}</code>): <br/>
                <code>{"<<nome>>"}</code> <code>{"<<endereco>>"}</code> <code>{"<<contato>>"}</code> <code>{"<<data_evento>>"}</code> <code>{"<<materiais>>"}</code> <code>{"<<empresa>>"}</code> <code>{"<<data_hoje>>"}</code>
              </div>
            </div>
          </section>

          <section className={styles.card} style={{ marginTop: "2rem" }}>
            <h2><IconReports size={20} /> Modelo: Relatórios</h2>
            <div className={styles.field}>
              <label>Estrutura HTML do Documento</label>
              <textarea 
                rows={10}
                value={settings.reportTemplate || ""}
                onChange={(e) => setSettings({ ...settings, reportTemplate: e.target.value })}
              />
              <div className={styles.placeholders}>
                Variáveis: <code>{"<<periodo>>"}</code> <code>{"<<conteudo>>"}</code> <code>{"<<empresa>>"}</code>
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
