import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const createRoom = async () => {
    setIsCreating(true);
    setError('');
    try {
      const response = await fetch('/api/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password || undefined })
      });
      const data = await response.json();
      if (data.roomId) {
        router.push(`/room/${data.roomId}?password=${encodeURIComponent(password || '')}`);
      } else {
        setError('فشل إنشاء الغرفة');
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    }
    setIsCreating(false);
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      setError('الرجاء إدخال رمز الغرفة');
      return;
    }
    router.push(`/room/${roomId.trim()}?password=${encodeURIComponent(password || '')}`);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>المساحة الصوتية</title>
        <meta name="description" content="غرفة صوتية خاصة مع مساعدين" />
      </Head>

      <div className={styles.header}>
        <div className={styles.logo}>
          <i className="fas fa-microphone-alt"></i>
        </div>
        <h1>المساحة الصوتية</h1>
        <p>غرفة صوتية خاصة مع نظام مساعدين متكامل</p>
      </div>

      <div className={styles.card}>
        <div className={styles.section}>
          <h2>إنشاء غرفة جديدة</h2>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="كلمة مرور الغرفة (اختياري)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
            />
            <i className="fas fa-lock"></i>
          </div>
          <button 
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={createRoom}
            disabled={isCreating}
          >
            {isCreating ? 'جاري الإنشاء...' : '🚀 إنشاء الغرفة'}
          </button>
        </div>

        <div className={styles.divider}>
          <span>أو</span>
        </div>

        <div className={styles.section}>
          <h2>الانضمام إلى غرفة</h2>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="رمز الغرفة (مثال: ABC123)"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              dir="ltr"
              style={{ letterSpacing: '2px' }}
            />
            <i className="fas fa-door-open"></i>
          </div>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="كلمة المرور (اختياري)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
            />
            <i className="fas fa-lock"></i>
          </div>
          <button 
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={joinRoom}
          >
            <i className="fas fa-sign-in-alt"></i> انضمام
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
      </div>

      <footer className={styles.footer}>
        <span>✦</span> مساحة صوتية خاصة <span>✦</span>
      </footer>
    </div>
  );
}
