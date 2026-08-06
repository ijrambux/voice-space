import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { VocaClient } from '@treyorr/voca-client';

export default function Room() {
  const router = useRouter();
  const { id, password } = router.query;
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isCohost, setIsCohost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const clientRef = useRef(null);

  useEffect(() => {
    if (!id) return;

    const initRoom = async () => {
      setLoading(true);
      try {
        // Create Voca client
        const client = new VocaClient({
          serverUrl: process.env.NEXT_PUBLIC_VOCA_SERVER || 'https://voca-server.vercel.app',
          roomId: id,
          password: password || undefined
        });

        clientRef.current = client;

        // Set up event listeners
        client.on('participants-update', (data) => {
          setParticipants(data.participants || []);
        });

        client.on('room-update', (data) => {
          setRoom(data);
        });

        // Connect
        await client.connect();

        // Check if user is host
        const user = client.getUser();
        setIsHost(user?.isHost || false);
        setIsCohost(user?.isCohost || false);

        setInviteLink(`${window.location.origin}/room/${id}?password=${password || ''}`);

      } catch (err) {
        console.error('Error joining room:', err);
        setError('تعذر الاتصال بالغرفة. تأكد من الرمز وكلمة المرور.');
      }
      setLoading(false);
    };

    initRoom();

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, [id, password]);

  const toggleMute = () => {
    if (!clientRef.current) return;
    const newState = !isMuted;
    setIsMuted(newState);
    clientRef.current.setMuted(newState);
  };

  const toggleParticipantMute = (participantId) => {
    if (!clientRef.current) return;
    clientRef.current.toggleMute(participantId);
  };

  const kickParticipant = (participantId) => {
    if (!clientRef.current) return;
    clientRef.current.kick(participantId);
  };

  const promoteToCohost = (participantId) => {
    if (!clientRef.current) return;
    clientRef.current.promoteToCohost(participantId);
  };

  const closeRoom = () => {
    if (!clientRef.current) return;
    if (confirm('هل أنت متأكد من إغلاق الغرفة؟')) {
      clientRef.current.closeRoom();
      router.push('/');
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('✅ تم نسخ الرابط');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>جاري الاتصال بالغرفة...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>خطأ في الاتصال</h2>
        <p>{error}</p>
        <button className="btn btnPrimary" onClick={() => router.push('/')}>
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const speakers = participants.filter(p => p.isSpeaker);
  const hosts = participants.filter(p => p.isHost);
  const cohosts = participants.filter(p => p.isCohost);

  return (
    <div className="room-container">
      <Head>
        <title>غرفة #{id} | المساحة الصوتية</title>
      </Head>

      <div className="room-header">
        <div className="room-info">
          <h1>
            <i className="fas fa-users"></i>
            غرفة #{id}
          </h1>
          <div className="room-stats">
            <span className="stat">
              <i className="fas fa-user"></i> {participants.length}
            </span>
            <span className="stat">
              <i className="fas fa-microphone"></i> {speakers.length}
            </span>
            <span className="stat gold">
              <i className="fas fa-crown"></i> {hosts.length}
            </span>
            <span className="stat cohost">
              <i className="fas fa-user-cog"></i> {cohosts.length}
            </span>
          </div>
        </div>
        <div className="room-actions">
          <button className="btn btnSecondary" onClick={copyInviteLink}>
            <i className="fas fa-share-alt"></i> دعوة
          </button>
          {(isHost || isCohost) && (
            <button className="btn btnDanger" onClick={closeRoom}>
              <i className="fas fa-door-closed"></i> إغلاق
            </button>
          )}
        </div>
      </div>

      <div className="room-controls">
        <button 
          className={`btn ${isMuted ? 'btnSecondary' : 'btnSuccess'}`}
          onClick={toggleMute}
        >
          <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
          {isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
        </button>
      </div>

      <div className="participants-list">
        <h3><i className="fas fa-list"></i> المشاركون</h3>
        {participants.length === 0 ? (
          <div className="empty-state">لا يوجد مشاركون</div>
        ) : (
          participants.map((p) => {
            let roleClass = 'listener';
            let roleIcon = 'fa-headphones';
            let roleText = 'مستمع';
            if (p.isHost) { roleClass = 'host'; roleIcon = 'fa-crown'; roleText = 'مسؤول'; }
            else if (p.isCohost) { roleClass = 'cohost'; roleIcon = 'fa-user-cog'; roleText = 'مساعد'; }
            else if (p.isSpeaker) { roleClass = 'speaker'; roleIcon = 'fa-microphone'; roleText = 'متحدث'; }

            const isCurrentUser = p.isSelf;
            const canManage = isHost || isCohost;

            return (
              <div key={p.id} className="participant-item">
                <div className={`avatar ${roleClass}`}>
                  {p.isHost ? '👑' : p.isCohost ? '🤝' : p.name?.charAt(0) || '?'}
                </div>
                <div className="participant-name">
                  {p.name || 'مستخدم'}
                  {isCurrentUser && <span className="me">(أنت)</span>}
                </div>
                <span className={`role ${roleClass}`}>
                  <i className={`fas ${roleIcon}`}></i> {roleText}
                </span>
                {canManage && !p.isHost && !isCurrentUser && (
                  <div className="participant-actions">
                    <button 
                      className="btnSmall" 
                      onClick={() => toggleParticipantMute(p.id)}
                      title={p.isSpeaker ? 'كتم' : 'تفعيل'}
                    >
                      <i className={`fas ${p.isSpeaker ? 'fa-microphone' : 'fa-microphone-slash'}`}></i>
                    </button>
                    {isHost && (
                      <button 
                        className="btnSmall cohost" 
                        onClick={() => promoteToCohost(p.id)}
                        title="تعيين مساعد"
                      >
                        <i className="fas fa-user-cog"></i>
                      </button>
                    )}
                    <button 
                      className="btnSmall danger" 
                      onClick={() => kickParticipant(p.id)}
                      title="طرد"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .room-container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .room-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .room-header h1 { font-size: 1.2rem; margin: 0; display: flex; align-items: center; gap: 8px; }
        .room-header h1 i { color: var(--primary); }
        .room-stats { display: flex; gap: 12px; margin-top: 6px; flex-wrap: wrap; }
        .stat { font-size: 0.7rem; color: var(--text-secondary); background: var(--bg-dark); padding: 2px 10px; border-radius: 12px; border: 1px solid var(--border); }
        .stat.gold { color: var(--gold); border-color: rgba(255,215,0,0.2); }
        .stat.cohost { color: var(--cohost); border-color: rgba(0,188,212,0.2); }
        .room-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .room-controls { margin-bottom: 16px; }
        .participants-list { background: var(--bg-card); border-radius: 16px; padding: 16px; border: 1px solid var(--border); }
        .participants-list h3 { font-size: 0.8rem; margin-bottom: 12px; color: var(--text-secondary); }
        .participant-item { display: flex; align-items: center; gap: 10px; padding: 6px 12px; border-radius: 10px; background: var(--bg-dark); margin-bottom: 4px; border: 1px solid transparent; transition: var(--transition); }
        .participant-item:hover { border-color: var(--border); }
        .avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.7rem; color: #fff; flex-shrink: 0; }
        .avatar.host { background: linear-gradient(135deg, var(--gold), #F9A825); }
        .avatar.cohost { background: linear-gradient(135deg, var(--cohost), #00838F); }
        .avatar.speaker { background: linear-gradient(135deg, var(--success), #00C853); }
        .avatar.listener { background: var(--text-muted); }
        .participant-name { flex: 1; font-size: 0.8rem; font-weight: 500; }
        .participant-name .me { font-size: 0.55rem; color: var(--text-muted); font-weight: 400; margin-right: 4px; }
        .role { font-size: 0.55rem; padding: 1px 8px; border-radius: 10px; font-weight: 600; }
        .role.host { background: rgba(255,215,0,0.15); color: var(--gold); }
        .role.cohost { background: rgba(0,188,212,0.15); color: var(--cohost); }
        .role.speaker { background: rgba(0,230,118,0.12); color: var(--success); }
        .role.listener { background: rgba(255,255,255,0.04); color: var(--text-muted); }
        .participant-actions { display: flex; gap: 4px; }
        .btnSmall { padding: 2px 6px; border-radius: 4px; border: none; font-size: 0.6rem; cursor: pointer; transition: var(--transition); background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border); }
        .btnSmall:hover { border-color: var(--primary); color: var(--text-primary); }
        .btnSmall.cohost:hover { border-color: var(--cohost); color: var(--cohost); }
        .btnSmall.danger:hover { border-color: var(--danger); color: var(--danger); }
        .btn { padding: 8px 16px; border-radius: 10px; border: none; font-weight: 600; cursor: pointer; transition: var(--transition); font-family: 'Cairo', sans-serif; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px; }
        .btnSuccess { background: linear-gradient(135deg, var(--success), #00C853); color: #000; }
        .btnSecondary { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
        .btnSecondary:hover { border-color: var(--primary); color: var(--text-primary); }
        .btnDanger { background: linear-gradient(135deg, var(--danger), #D81B60); color: #fff; }
        .empty-state { text-align: center; padding: 20px; color: var(--text-muted); font-size: 0.9rem; }
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; }
        .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 0.7s linear infinite; }
        .error-container { text-align: center; padding: 40px 20px; max-width: 400px; margin: 0 auto; }
        .error-icon { font-size: 3rem; margin-bottom: 12px; }
        .error-container button { margin-top: 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
