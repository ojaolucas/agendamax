import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./users.module.css";
import UserActions from "./UserActions";

export default async function UsersPage() {
  const session = await getSession();
  
  if (session?.user.role !== "MANAGER") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Gestão de Usuários</h1>
          <p>Administre as contas e permissões do sistema</p>
        </div>
        <Link href="/dashboard/users/new" className={styles.addButton}>
          Novo Usuário
        </Link>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>CPF</th>
              <th>Cargo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <span className={`${styles.statusDot} ${user.active ? styles.active : styles.inactive}`}></span>
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.cpf}</td>
                <td>
                  <span className={`${styles.roleBadge} ${styles[user.role.toLowerCase()]}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <UserActions userId={user.id} initialActive={user.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
