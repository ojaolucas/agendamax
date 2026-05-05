"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";
import { 
  IconDashboard, 
  IconEvents, 
  IconCalendar, 
  IconReports, 
  IconUser, 
  IconUsers, 
  IconPlus,
  IconLogOut,
  IconX
} from "./Icons";

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <IconDashboard /> },
    { name: "Eventos", path: "/dashboard/events", icon: <IconEvents /> },
    { name: "Calendário", path: "/dashboard/calendar", icon: <IconCalendar /> },
    { name: "Relatórios", path: "/dashboard/reports", icon: <IconReports /> },
    { name: "Meu Perfil", path: "/dashboard/profile", icon: <IconUser /> },
  ];

  if (user?.role === "MANAGER") {
    menuItems.push({ name: "Usuários", path: "/dashboard/users", icon: <IconUsers /> });
  }

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className={styles.mobileToggle} onClick={toggleSidebar}>
        {isOpen ? <IconX /> : <IconDashboard />}
      </button>

      {/* Overlay */}
      {isOpen && <div className={styles.overlay} onClick={toggleSidebar} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.logo}>
          <h1>agendaMAX</h1>
          <button className={styles.closeBtn} onClick={toggleSidebar}>
            <IconX />
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsOpen(false)}
              className={`${styles.navItem} ${
                pathname === item.path ? styles.active : ""
              }`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.name}>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.userProfile}>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user?.name}</p>
            <p className={styles.userRole}>{user?.role}</p>
          </div>
          <button 
            className={styles.logoutBtn}
            onClick={async () => {
               await fetch('/api/auth/logout', { method: 'POST' });
               window.location.href = '/';
            }}
          >
            <IconLogOut size={16} /> Sair
          </button>
        </div>
      </aside>
    </>
  );
}
