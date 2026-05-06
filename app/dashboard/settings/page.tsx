"use client";

import { useState, useEffect } from "react";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => { setSettings(data); setLoading(false); });
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setSettings({ ...settings, logo: reader.result as string });
    reader.readAsDataURL(file);
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
        setMessage({ type: "error", text: data.error || "Erro ao salvar" });
      }
    } catch {
      setMessage({ type: "error", text: "Erro ao conectar ao servidor" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Carregando...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Personalização</h1>
        <p>Configure o logo e as informações da empresa para o Termo de Entrega</p>
      </header>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>{message.text}</div>
      )}

      <form onSubmit={handleSave} className={styles.form}>
        {/* LOGO */}
        <section className={styles.card}>
          <h2>Logo da Empresa</h2>
          <div className={styles.logoRow}>
            <div className={styles.logoPreview}>
              {settings.logo
                ? <img src={settings.logo} alt="Logo" />
                : <span>Sem Logo</span>}
            </div>
            <div className={styles.logoActions}>
              <p className={styles.hint}>Tamanho recomendado: até 300×120 px. Formatos: PNG, JPG.</p>
              <label className={styles.uploadBtn}>
                Escolher Imagem
                <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
              </label>
              {settings.logo && (
                <button
                  type="button"
                  className={styles.removeLogoBtn}
                  onClick={() => setSettings({ ...settings, logo: null })}
                >
                  Remover Logo
                </button>
              )}
            </div>
          </div>
        </section>

        {/* DADOS DA EMPRESA */}
        <section className={styles.card}>
          <h2>Dados da Empresa</h2>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Nome da Empresa</label>
              <input
                type="text"
                value={settings.companyName || ""}
                onChange={e => setSettings({ ...settings, companyName: e.target.value })}
                placeholder="Ex: Padrão Locações"
              />
            </div>
            <div className={styles.field}>
              <label>Telefone</label>
              <input
                type="text"
                value={settings.phone || ""}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className={styles.field}>
              <label>E-mail</label>
              <input
                type="email"
                value={settings.email || ""}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                placeholder="email@empresa.com"
              />
            </div>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Endereço Completo (aparece no rodapé do termo)</label>
              <input
                type="text"
                value={settings.address || ""}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                placeholder="Rua, Nº, Bairro - Cidade - UF. CNPJ: 00.000.000/0001-00"
              />
            </div>
          </div>
        </section>

        {/* PREVIEW */}
        <section className={styles.card}>
          <h2>Pré-visualização do Cabeçalho</h2>
          <div className={styles.preview}>
            {settings.logo
              ? <img src={settings.logo} alt="Logo" className={styles.previewLogo} />
              : (
                <div className={styles.previewPlaceholder}>
                  <strong>{settings.companyName || "Nome da Empresa"}</strong>
                  <span>A MONTADORA DO SEU EVENTO</span>
                </div>
              )}
            <div className={styles.previewDivider} />
            <p className={styles.previewFooter}>
              {settings.address || "Endereço da empresa"} &nbsp;|&nbsp; Fone: {settings.phone || "(00) 0000-0000"}
            </p>
          </div>
        </section>

        <div className={styles.submitRow}>
          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Configurações"}
          </button>
        </div>
      </form>
    </div>
  );
}
