const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Room state
const rooms = new Map();

// Helper: Generate room ID
function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// API: Create room
app.post('/api/create-room', (req, res) => {
  const { password } = req.body;
  const roomId = generateRoomId();
  
  rooms.set(roomId, {
    id: roomId,
    password: password || null,
    hostId: null,
    participants: [],
    isActive: true,
    createdAt: Date.now()
  });

  res.json({ roomId });
});

// Socket.io handling
io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  socket.on('join-room', ({ roomId, password, username }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', 'الغرفة غير موجودة');
      return;
    }

    if (!room.isActive) {
      socket.emit('error', 'الغرفة مغلقة');
      return;
    }

    // Check password
    if (room.password && room.password !== password) {
      socket.emit('error', 'كلمة المرور غير صحيحة');
      return;
    }

    // Join room
    socket.join(roomId);
    
    const participant = {
      id: socket.id,
      name: username || 'مستخدم',
      isHost: room.participants.length === 0,
      isCohost: false,
      isSpeaker: true,
      isSelf: true
    };

    if (participant.isHost) {
      room.hostId = socket.id;
    }

    room.participants.push(participant);
    
    // Send current room state to client
    socket.emit('room-state', {
      roomId,
      participants: room.participants,
      isHost: participant.isHost,
      isCohost: participant.isCohost
    });

    // Notify others
    socket.to(roomId).emit('participant-joined', participant);

    // Update participants list for all
    io.to(roomId).emit('participants-update', {
      participants: room.participants
    });
  });

  // Toggle mute
  socket.on('toggle-mute', ({ roomId, participantId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find(p => p.id === participantId);
    if (participant) {
      participant.isSpeaker = !participant.isSpeaker;
      io.to(roomId).emit('participants-update', {
        participants: room.participants
      });
    }
  });

  // Promote to co-host
  socket.on('promote-cohost', ({ roomId, participantId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const participant = room.participants.find(p => p.id === participantId);
    if (participant) {
      participant.isCohost = true;
      io.to(roomId).emit('participants-update', {
        participants: room.participants
      });
    }
  });

  // Kick participant
  socket.on('kick-participant', ({ roomId, participantId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.participants = room.participants.filter(p => p.id !== participantId);
    io.to(roomId).emit('participants-update', {
      participants: room.participants
    });
    io.to(participantId).emit('kicked');
  });

  // Close room
  socket.on('close-room', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.isActive = false;
    io.to(roomId).emit('room-closed');
    rooms.delete(roomId);
  });

  // Disconnect
  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms) {
      const participant = room.participants.find(p => p.id === socket.id);
      if (participant) {
        room.participants = room.participants.filter(p => p.id !== socket.id);
        io.to(roomId).emit('participants-update', {
          participants: room.participants
        });
        
        if (room.participants.length === 0) {
          rooms.delete(roomId);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Voice Space Server running on port ${PORT}`);
});
