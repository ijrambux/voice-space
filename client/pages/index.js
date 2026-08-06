import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Room() {
  const router = useRouter();
  const { id, password, host } = router.query;
  const [roomData, setRoomData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!id) return;

    // استرجاع بيانات الغرفة
    const rooms = JSON.parse(localStorage.getItem('rooms') || '{}');
    const room = rooms[id];

    if (!room || !room.isActive) {
      router.push('/');
      return;
    }

    setRoomData(room);
    setIsHost(host === 'true');

    // محاكاة مشاركين
    setParticipants([
      { id: '1', name: 'أنت', isHost: host === 'true', isSpeaker: true, isSelf: true },
      { id: '2', name: 'أحمد', isHost: false, isSpeaker: true, isSelf: false },
      { id: '3', name: 'سارة', isHost: false, isSpeaker: false, isSelf: false },
    ]);

  }, [id, host, router]);

  if (!roomData) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>جاري تحميل الغرفة...</p>
      </div>
    );
  }

  const speakers = participants.filter(p => p.isSpeaker);
  const hosts = participants.filter(p => p.isHost);

  return (
    <>
      <Head>
        <title>غرفة #{id} | The Cook Rat</title>
      </Head>

      <div className="room-container">
        <div className="room-header">
          <h1>🎤 غرفة #{id}</h1>
          <div className="room-stats">
            <span>👥 {participants.length}</span>
            <span>🎙 {speakers.length}</span>
            <span>👑 {hosts.length}</span>
          </div>
          {isHost && (
            <button className="btn btn-danger" onClick={() => {
              const rooms = JSON.parse(localStorage.getItem('rooms') || '{}');
              if (rooms[id]) {
                rooms[id].isActive = false;
                localStorage.setItem('rooms', JSON.stringify(rooms));
              }
              router.push('/');
            }}>
              🔒 إغلاق الغرفة
            </button>
          )}
        </div>

        <div className="participants-list">
          <h3>المشاركون</h3>
          {participants.map(p => (
            <div key={p.id} className="participant">
              <span className="avatar">
                {p.isHost ? '👑' : p.isSpeaker ? '🎤' : '🎧'}
              </span>
              <span>{p.name} {p.isSelf && '(أنت)'}</span>
              <span className="role">
                {p.isHost ? 'مسؤول' : p.isSpeaker ? 'متحدث' : 'مستمع'}
              </span>
            </div>
          ))}
        </div>

        <div className="room-actions">
          <button className="btn btn-primary" onClick={() => alert('✅ تم نسخ الرابط')}>
            📋 نسخ رابط الدعوة
          </button>
          <button className="btn btn-secondary" onClick={() => router.push('/')}>
            🏠 العودة للرئيسية
          </button>
        </div>
      </div>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
          background: #050a0f !important;
          min-height: 100vh;
          font-family: 'Cairo', sans-serif;
          color: #e8f4f8;
        }
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 16px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #1a3a4a;
          border-top: 3px solid #00f0ff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .room-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px 16px;
          min-height: 100vh;
          background: #050a0f;
        }
        .room-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid #1a3a4a;
          margin-bottom: 20px;
        }
        .room-header h1 {
          flex: 1;
          font-size: 1.3rem;
          color: #00f0ff;
        }
        .room-stats {
          display: flex;
          gap: 12px;
          font-size: 0.8rem;
          color: #8ab4c8;
        }
        .btn {
          padding: 8px 16px;
          border-radius: 10px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Cairo', sans-serif;
          font-size: 0.8rem;
        }
        .btn-primary {
          background: linear-gradient(135deg, #00f0ff, #0099cc);
          color: #000;
        }
        .btn-secondary {
          background: transparent;
          color: #8ab4c8;
          border: 1px solid #1a3a4a;
        }
        .btn-danger {
          background: linear-gradient(135deg, #ff3366, #cc0044);
          color: #fff;
        }
        .participants-list {
          background: #0a1820;
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #1a3a4a;
          margin-bottom: 16px;
        }
        .participants-list h3 {
          font-size: 0.8rem;
          color: #8ab4c8;
          margin-bottom: 12px;
        }
        .participant {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 10px;
          background: #050a0f;
          margin-bottom: 4px;
        }
        .participant .avatar { font-size: 1rem; }
        .participant .role {
          margin-right: auto;
          font-size: 0.6rem;
          padding: 2px 10px;
          border-radius: 20px;
          background: rgba(0, 240, 255, 0.08);
          color: #8ab4c8;
        }
        .room-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .room-actions .btn { flex: 1; min-width: 120px; justify-content: center; }
      `}</style>
    </>
  );
}
