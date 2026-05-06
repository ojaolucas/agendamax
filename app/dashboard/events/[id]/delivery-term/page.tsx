import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import styles from "./delivery-term.module.css";
import PrintButton from "./PrintButton";

export default async function DeliveryTermPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) notFound();

  return (
    <div className={styles.page}>
      <div className={styles.document}>
        <header className={styles.header}>
          <h1>TERMO DE ENTREGA E RESPONSABILIDADE</h1>
          <p>agendaMAX - Locação de Estruturas para Eventos</p>
        </header>

        <section className={styles.content}>
          <p>
            Pelo presente instrumento, a <strong>agendaMAX</strong> entrega ao cliente abaixo identificado, 
            os materiais e estruturas descritos neste termo, em perfeitas condições de uso e conservação.
          </p>

          <div className={styles.infoBox}>
            <p><strong>Evento:</strong> {event.eventName}</p>
            <p><strong>Cliente:</strong> {event.clientName}</p>
            <p><strong>Local:</strong> {event.location}</p>
            <p><strong>Endereço:</strong> {event.address || event.location}</p>
            <p><strong>Contato:</strong> {event.clientContact || "Não informado"}</p>
            <p><strong>Data de Entrega:</strong> {format(new Date(event.setupDatetime), "dd/MM/yyyy HH:mm")}</p>
          </div>

          <div className={styles.materials}>
            <h3>RELAÇÃO DE MATERIAIS</h3>
            <div className={styles.materialsList}>
              {event.materials.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          <div className={styles.terms}>
            <h3>TERMOS E CONDIÇÕES</h3>
            <p>1. O cliente declara ter recebido os materiais em perfeito estado.</p>
            <p>2. O cliente assume total responsabilidade pela guarda e conservação dos materiais até a data da desmontagem ({format(new Date(event.teardownDatetime), "dd/MM/yyyy")}).</p>
            <p>3. Eventuais danos ou extravios serão cobrados conforme tabela vigente da locadora.</p>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.signatures}>
            <div className={styles.signatureLine}>
              <div className={styles.line}></div>
              <p>agendaMAX (Entregador)</p>
            </div>
            <div className={styles.signatureLine}>
              <div className={styles.line}></div>
              <p>{event.clientName} (Responsável)</p>
            </div>
          </div>
          <p className={styles.dateCity}>
            São Paulo, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </footer>
      </div>
      <PrintButton />
    </div>
  );
}
