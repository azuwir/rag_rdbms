import styles from "./page.module.css";
import RagChat from "./rag-chat";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>RAG untuk Data Terstruktur</h1>
          <p>
            Tanyakan apa pun tentang <b>Production</b>, <b>Revenue</b>, dan{" "}
            <b>LOP</b>. Aplikasi akan: (1) membuat SQL dari pertanyaan Anda, (2)
            mengeksekusi ke PostgreSQL, lalu (3) merangkum jawabannya.
          </p>
        </div>

        <RagChat />
      </main>
    </div>
  );
}
