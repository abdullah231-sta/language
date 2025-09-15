const { createServer } = require('http');
const { Server } = require('socket.io');
const { parse } = require('url');

const server = createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store connected users and their socket IDs
const connectedUsers = new Map();
const groupMembers = new Map();
const typingUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication/connection
  socket.on('authenticate', (data) => {
    const { userId, username } = data;
    connectedUsers.set(socket.id, { userId, username, socketId: socket.id });
    console.log(`User ${username} (${userId}) authenticated`);

    // Send confirmation
    socket.emit('authenticated', { success: true });
  });

  // Handle joining a group
  socket.on('join_group', (data) => {
    const { groupId } = data;
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    // Leave previous group if any
    const previousGroup = Array.from(groupMembers.entries())
      .find(([_, members]) => members.has(socket.id))?.[0];

    if (previousGroup) {
      groupMembers.get(previousGroup).delete(socket.id);
      socket.leave(previousGroup);
    }

    // Join new group
    if (!groupMembers.has(groupId)) {
      groupMembers.set(groupId, new Set());
    }
    groupMembers.get(groupId).add(socket.id);
    socket.join(groupId);

    // Notify other group members
    socket.to(groupId).emit('user_joined', {
      userId: user.userId,
      username: user.username,
      timestamp: Date.now()
    });

    // Send current online users to the new member
    const onlineUsers = Array.from(groupMembers.get(groupId))
      .map(socketId => connectedUsers.get(socketId))
      .filter(Boolean)
      .map(user => ({ userId: user.userId, username: user.username }));

    socket.emit('online_users', { users: onlineUsers });
  });

  // Handle leaving a group
  socket.on('leave_group', (data) => {
    const { groupId } = data;
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    groupMembers.get(groupId)?.delete(socket.id);
    socket.leave(groupId);

    // Notify other group members
    socket.to(groupId).emit('user_left', {
      userId: user.userId,
      username: user.username,
      timestamp: Date.now()
    });

    // Update typing indicators
    updateTypingIndicators(groupId);
  });

  // Handle chat messages
  socket.on('send_message', (data) => {
    const { groupId, content, type = 'text', senderAvatar = '', replyTo } = data;
    const user = connectedUsers.get(socket.id);
    if (!user || !groupId) return;

    // Stop typing when message is sent
    handleTypingStop(socket.id, groupId);

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      senderId: user.userId,
      senderName: user.username,
      senderAvatar,
      groupId,
      timestamp: Date.now(),
      type,
      replyTo
    };

    // Broadcast message to all group members
    io.to(groupId).emit('new_message', message);
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { groupId } = data;
    const user = connectedUsers.get(socket.id);
    if (!user || !groupId) return;

    if (!typingUsers.has(groupId)) {
      typingUsers.set(groupId, new Set());
    }
    typingUsers.get(groupId).add(socket.id);
    updateTypingIndicators(groupId);
  });

  socket.on('typing_stop', (data) => {
    const { groupId } = data;
    handleTypingStop(socket.id, groupId);
  });

  // Handle reactions
  socket.on('add_reaction', (data) => {
    const { groupId, messageId, emoji } = data;
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    io.to(groupId).emit('message_reaction', {
      messageId,
      emoji,
      userId: user.userId,
      action: 'add',
      timestamp: Date.now()
    });
  });

  socket.on('remove_reaction', (data) => {
    const { groupId, messageId, emoji } = data;
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    io.to(groupId).emit('message_reaction', {
      messageId,
      emoji,
      userId: user.userId,
      action: 'remove',
      timestamp: Date.now()
    });
  });

  // Handle message editing
  socket.on('edit_message', (data) => {
    const { groupId, messageId, content } = data;
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    io.to(groupId).emit('message_edited', {
      messageId,
      newContent: content,
      editedAt: Date.now()
    });
  });

  // Handle message deletion
  socket.on('delete_message', (data) => {
    const { groupId, messageId } = data;
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    io.to(groupId).emit('message_deleted', {
      messageId,
      deletedAt: Date.now()
    });
  });

  // Handle voice controls
  socket.on('voice_control', (data) => {
    const { groupId, action, targetUserId } = data;
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    console.log(`Voice control: ${action} for user ${targetUserId} by ${user.username}`);

    // Broadcast voice control change to all group members
    io.to(groupId).emit('voice_control_changed', {
      action,
      targetUserId,
      initiatedBy: user.userId,
      timestamp: Date.now()
    });
  });

  // Handle emoji reactions
  socket.on('emoji_reaction', (data) => {
    const { groupId, emoji, seatPosition } = data;
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    console.log(`Emoji reaction: ${emoji} from seat ${seatPosition} by ${user.username}`);

    // Broadcast emoji reaction to all group members
    io.to(groupId).emit('emoji_reaction_received', {
      emoji,
      seatPosition,
      userId: user.userId,
      username: user.username,
      timestamp: Date.now()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const user = connectedUsers.get(socket.id);
    if (user) {
      // Find and leave all groups
      groupMembers.forEach((members, groupId) => {
        if (members.has(socket.id)) {
          members.delete(socket.id);
          socket.to(groupId).emit('user_left', {
            userId: user.userId,
            username: user.username,
            timestamp: Date.now()
          });
          updateTypingIndicators(groupId);
        }
      });

      connectedUsers.delete(socket.id);
    }
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

function handleTypingStop(socketId, groupId) {
  typingUsers.get(groupId)?.delete(socketId);
  updateTypingIndicators(groupId);
}

function updateTypingIndicators(groupId) {
  const typingSockets = typingUsers.get(groupId);
  if (!typingSockets) return;

  const typingUsersList = Array.from(typingSockets)
    .map(socketId => connectedUsers.get(socketId))
    .filter(Boolean)
    .map(user => ({ userId: user.userId, username: user.username }));

  io.to(groupId).emit('typing_update', {
    typingUsers: typingUsersList,
    timestamp: Date.now()
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});