import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

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
    <>
      <Head>
        <title>The Cook Rat - المساحة الصوتية</title>
        <meta name="description" content="غرفة صوتية خاصة مع نظام مساعدين متكامل" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐀</text></svg>" />
        <meta name="theme-color" content="#050a0f" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="container">
        <div className="header">
          <div className="logo-wrapper">
            <div className="logo-container">
              <img 
                src="https://pbs.twimg.com/profile_images/2083986675873525760/_swZy6tJ_400x400.jpg" 
                alt="The Cook Rat" 
                className="logo-image"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="logo-text">
              <h1>The Cook Rat</h1>
              <p>المساحة الصوتية</p>
            </div>
          </div>
          <div className="tagline">
            <span className="fire-icon">🔥</span>
            غرفة صوتية خاصة مع نظام مساعدين متكامل
            <span className="fire-icon">🔥</span>
          </div>
        </div>

        <div className="card">
          <div className="section">
            <h2>🚀 إنشاء غرفة جديدة</h2>
            <div className="input-group">
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
              className="btn btn-primary"
              onClick={createRoom}
              disabled={isCreating}
            >
              {isCreating ? 'جاري الإنشاء...' : 'إنشاء الغرفة'}
            </button>
          </div>

          <div className="divider"><span>أو</span></div>

          <div className="section">
            <h2>🔑 الانضمام إلى غرفة</h2>
            <div className="input-group">
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
            <div className="input-group">
              <input
                type="text"
                placeholder="كلمة المرور (اختياري)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
              />
              <i className="fas fa-lock"></i>
            </div>
            <button className="btn btn-secondary" onClick={joinRoom}>
              <i className="fas fa-sign-in-alt"></i> انضمام
            </button>
          </div>

          {error && <div className="error">{error}</div>}
        </div>

        <footer className="footer">
          <span>🐀</span> The Cook Rat <span>🔥</span>
        </footer>
      </div>

      <style jsx global>{`
        /* ===== إعادة تعيين كامل للصفحة ===== */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          background: #050a0f !important;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          font-family: 'Cairo', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ===== المتغيرات ===== */
        :root {
          --primary: #00f0ff;
          --primary-dark: #0099cc;
          --primary-glow: rgba(0, 240, 255, 0.3);
          --bg-dark: #050a0f;
          --bg-card: #0a1820;
          --bg-card-hover: #102a35;
          --text-primary: #e8f4f8;
          --text-secondary: #8ab4c8;
          --text-muted: #4a6a7a;
          --border: #1a3a4a;
          --border-hover: #00f0ff;
          --success: #00ff88;
          --danger: #ff3366;
          --gold: #ffd700;
          --cohost: #00BCD4;
          --radius: 16px;
          --glow: 0 0 60px rgba(0, 240, 255, 0.1);
          --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* ===== الحاوية الرئيسية ===== */
        .container {
          max-width: 440px;
          margin: 0 auto;
          padding: 20px 16px 30px;
          min-height: 100vh;
          background: var(--bg-dark);
          position: relative;
          overflow: hidden;
        }

        /* ===== خلفية نارية متحركة ===== */
        .container::before {
          content: '';
          position: fixed;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: 
            radial-gradient(ellipse at 20% 30%, rgba(0, 240, 255, 0.05) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 70%, rgba(255, 51, 102, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(0, 240, 255, 0.02) 0%, transparent 40%);
          z-index: 0;
          animation: fireGlow 10s ease-in-out infinite alternate;
          pointer-events: none;
        }

        @keyframes fireGlow {
          0% { opacity: 0.6; transform: scale(1) rotate(0deg); }
          100% { opacity: 1; transform: scale(1.05) rotate(3deg); }
        }

        /* ===== الهيدر ===== */
        .header {
          text-align: center;
          padding: 20px 0 16px;
          position: relative;
          z-index: 1;
        }

        .logo-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 8px;
        }

        .logo-container {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          overflow: hidden;
          border: 2px solid var(--primary);
          box-shadow: 0 0 30px var(--primary-glow);
          flex-shrink: 0;
          background: var(--bg-dark);
          transition: var(--transition);
        }

        .logo-container:hover {
          transform: scale(1.05);
          box-shadow: 0 0 50px var(--primary-glow);
        }

        .logo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .logo-text h1 {
          font-size: 1.8rem;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(135deg, #00f0ff, #0099cc, #00f0ff);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 3s ease infinite;
          letter-spacing: -0.5px;
          text-shadow: 0 0 40px rgba(0, 240, 255, 0.15);
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .logo-text p {
          color: var(--text-secondary);
          font-size: 0.75rem;
          margin: -4px 0 0;
          letter-spacing: 3px;
          font-weight: 600;
        }

        .tagline {
          color: var(--text-secondary);
          font-size: 0.8rem;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .fire-icon {
          display: inline-block;
          animation: firePulse 1.5s ease-in-out infinite alternate;
        }

        @keyframes firePulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          100% { transform: scale(1.1); opacity: 1; }
        }

        /* ===== البطاقة ===== */
        .card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px 20px;
          position: relative;
          z-index: 1;
          box-shadow: var(--glow);
          backdrop-filter: blur(10px);
          transition: var(--transition);
        }

        .card:hover {
          border-color: rgba(0, 240, 255, 0.2);
          box-shadow: 0 0 60px rgba(0, 240, 255, 0.06);
        }

        .card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--primary), transparent);
          opacity: 0.4;
        }

        .section {
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .section h2 {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ===== المدخلات ===== */
        .input-group {
          position: relative;
          margin-bottom: 10px;
        }

        .input-group input {
          width: 100%;
          padding: 12px 16px;
          background: var(--bg-dark);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text-primary);
          font-family: 'Cairo', sans-serif;
          font-size: 0.9rem;
          outline: none;
          transition: var(--transition);
          text-align: right;
        }

        .input-group input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(0, 240, 255, 0.06), 0 0 20px rgba(0, 240, 255, 0.05);
        }

        .input-group input::placeholder {
          color: var(--text-muted);
          opacity: 0.5;
        }

        .input-group .fas {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        /* ===== الأزرار ===== */
        .btn {
          padding: 12px 20px;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition);
          font-family: 'Cairo', sans-serif;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: #000;
          box-shadow: 0 4px 25px rgba(0, 240, 255, 0.2);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(0, 240, 255, 0.35);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }

        .btn-secondary:hover {
          border-color: var(--primary);
          color: var(--text-primary);
          box-shadow: 0 0 30px rgba(0, 240, 255, 0.05);
        }

        /* ===== الفاصل ===== */
        .divider {
          display: flex;
          align-items: center;
          margin: 16px 0;
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .divider span {
          padding: 0 12px;
        }

        /* ===== الخطأ ===== */
        .error {
          background: rgba(255, 51, 102, 0.08);
          border: 1px solid rgba(255, 51, 102, 0.15);
          color: var(--danger);
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.8rem;
          margin-top: 12px;
        }

        /* ===== التذييل ===== */
        .footer {
          text-align: center;
          padding: 20px 0 6px;
          color: var(--text-muted);
          font-size: 0.7rem;
          border-top: 1px solid var(--border);
          margin-top: 24px;
          position: relative;
          z-index: 1;
        }

        .footer span {
          color: var(--primary);
        }

        /* ===== شريط التمرير ===== */
        ::-webkit-scrollbar {
          width: 4px;
          background: var(--bg-dark);
        }
        ::-webkit-scrollbar-track {
          background: var(--bg-dark);
        }
        ::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: var(--primary);
        }

        /* ===== التوافق مع الشاشات الصغيرة ===== */
        @media (max-width: 480px) {
          .container {
            padding: 12px 10px 20px;
          }
          .card {
            padding: 18px 14px;
          }
          .logo-text h1 {
            font-size: 1.4rem;
          }
          .logo-container {
            width: 50px;
            height: 50px;
          }
          .tagline {
            font-size: 0.7rem;
          }
        }
      `}</style>
    </>
  );
}
