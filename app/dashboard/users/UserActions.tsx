"use client";

import { useState } from "react";
import styles from "./users.module.css";
import { useRouter } from "next/navigation";

export default function UserActions({ userId, initialActive }: { userId: string, initialActive: boolean }) {
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleStatus = async () => {
    setLoading(true);
    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    if (res.ok) {
      setActive(!active);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button 
        onClick={() => router.push(`/dashboard/users/${userId}/edit`)}
        className={styles.actionBtn}
        style={{ background: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.2)" }}
      >
        Editar
      </button>
      <button 
        onClick={toggleStatus} 
        className={`${styles.actionBtn} ${active ? styles.deactivate : styles.activate}`}
        disabled={loading}
      >
        {active ? "Desativar" : "Ativar"}
      </button>
    </div>
  );
}
