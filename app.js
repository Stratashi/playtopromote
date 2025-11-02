// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBX0lxB7NZVMZftkB-T1jp9PfqNkQQHtXg",
  authDomain: "playtopromote.firebaseapp.com",
  projectId: "playtopromote",
  storageBucket: "playtopromote.firebasestorage.app",
  messagingSenderId: "947196888409",
  appId: "1:947196888409:web:7c3792b6fe34b238a17848",
  measurementId: "G-54BNGB4JPH"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Global State
let currentUser = null;
let currentUsername = "";
let currentLink = "";
let currentRoomId = null;
let roomUnsubscribe = null;
let roomsUnsubscribe = null;

// ============================================
// AUTHENTICATION & USER MANAGEMENT
// ============================================

async function initializeAuth() {
  try {
    const result = await auth.signInAnonymously();
    currentUser = result.user;
    console.log("✓ Anonymous auth successful:", currentUser.uid);
  } catch (error) {
    console.error("Auth error:", error);
    showError("Authentication failed: " + error.message);
  }
}

async function registerUser(username, link) {
  if (!currentUser) {
    showError("User not authenticated");
    return false;
  }

  try {
    await db.collection("users").doc(currentUser.uid).set({
      username: username,
      link: link,
      uid: currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    currentUsername = username;
    currentLink = link;
    console.log("✓ User registered:", username);
    return true;
  } catch (error) {
    console.error("Registration error:", error);
    showError("Failed to register: " + error.message);
    return false;
  }
}

// ============================================
// ROOM MANAGEMENT (REAL-TIME SYNC)
// ============================================

async function createRoom(roomName, gameType) {
  if (!currentUser || !currentUsername) {
    showError("Please register first");
    return null;
  }

  try {
    const roomRef = db.collection("rooms").doc();
    const roomId = roomRef.id;

    await roomRef.set({
      roomId: roomId,
      roomName: roomName,
      gameType: gameType || "Coin Flip",
      host: currentUser.uid,
      players: [
        {
          uid: currentUser.uid,
          username: currentUsername,
          link: currentLink,
          score: 0,
          joined: firebase.firestore.FieldValue.serverTimestamp()
        }
      ],
      status: "waiting",
      winner: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      maxPlayers: 4
    });

    console.log("✓ Room created:", roomId);
    return roomId;
  } catch (error) {
    console.error("Create room error:", error);
    showError("Failed to create room: " + error.message);
    return null;
  }
}

async function joinRoom(roomId) {
  if (!currentUser || !currentUsername) {
    showError("Please register first");
    return false;
  }

  try {
    const roomRef = db.collection("rooms").doc(roomId);
    const roomSnap = await roomRef.get();

    if (!roomSnap.exists) {
      showError("Room does not exist");
      return false;
    }

    const room = roomSnap.data();
    const playerExists = room.players.some(p => p.uid === currentUser.uid);
    if (playerExists) return true;

    if (room.players.length >= room.maxPlayers) {
      showError("Room is full");
      return false;
    }

    await roomRef.update({
      players: firebase.firestore.FieldValue.arrayUnion({
        uid: currentUser.uid,
        username: currentUsername,
        link: currentLink,
        score: 0,
        joined: firebase.firestore.FieldValue.serverTimestamp()
      })
    });

    console.log("✓ Joined room:", roomId);
    return true;
  } catch (error) {
    console.error("Join room error:", error);
    showError("Failed to join room: " + error.message);
    return false;
  }
}

async function leaveRoom(roomId) {
  if (!currentUser) return;

  try {
    const roomRef = db.collection("rooms").doc(roomId);
    const roomSnap = await roomRef.get();

    if (!roomSnap.exists) return;

    const room = roomSnap.data();
    const updatedPlayers = room.players.filter(p => p.uid !== currentUser.uid);

    if (updatedPlayers.length === 0) {
      await roomRef.delete();
    } else {
      await roomRef.update({ players: updatedPlayers });
    }

    console.log("✓ Left room:", roomId);
  } catch (error) {
    console.error("Leave room error:", error);
  }
}

// ============================================
// REAL-TIME LISTENERS (LIVE SYNC - THIS IS KEY!)
// ============================================

function subscribeToRoom(roomId, onUpdate) {
  if (roomUnsubscribe) roomUnsubscribe();

  roomUnsubscribe = db.collection("rooms").doc(roomId).onSnapshot(
    (snapshot) => {
      if (snapshot.exists) {
        const roomData = snapshot.data();
        console.log("🔄 Room updated:", roomData);
        onUpdate(roomData);
      }
    },
    (error) => {
      console.error("Room listener error:", error);
      showError("Failed to sync room: " + error.message);
    }
  );
}

function subscribeToRoomsList(onUpdate) {
  if (roomsUnsubscribe) roomsUnsubscribe();

  roomsUnsubscribe = db.collection("rooms")
    .where("status", "==", "waiting")
    .limit(10)
    .onSnapshot(
      (snapshot) => {
        const rooms = [];
        snapshot.forEach((doc) => {
          rooms.push({ id: doc.id, ...doc.data() });
        });
        console.log("🔄 Rooms list updated:", rooms.length, "rooms");
        onUpdate(rooms);
      },
      (error) => {
        console.error("Rooms list listener error:", error);
        showError("Failed to load rooms: " + error.message);
      }
    );
}

// ============================================
// GAME LOGIC
// ============================================

async function startGame(roomId) {
  try {
    await db.collection("rooms").doc(roomId).update({
      status: "playing",
      gameStartTime: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("✓ Game started");
  } catch (error) {
    console.error("Start game error:", error);
  }
}

async function updatePlayerScore(roomId, playerId, points) {
  try {
    const roomRef = db.collection("rooms").doc(roomId);
    const roomSnap = await roomRef.get();
    const room = roomSnap.data();

    const updatedPlayers = room.players.map(p => {
      if (p.uid === playerId) {
        return { ...p, score: (p.score || 0) + points };
      }
      return p;
    });

    await roomRef.update({ players: updatedPlayers });
  } catch (error) {
    console.error("Update score error:", error);
  }
}

async function finishGame(roomId, winnerId, winnerData) {
  try {
    await db.collection("rooms").doc(roomId).update({
      status: "finished",
      winner: {
        uid: winnerId,
        username: winnerData.username,
        link: winnerData.link,
        score: winnerData.score
      },
      endTime: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("✓ Game finished, winner:", winnerId);
  } catch (error) {
    console.error("Finish game error:", error);
  }
}

// ============================================
// UI HELPERS
// ============================================

function showError(message) {
  console.error("❌", message);
  const errorDiv = document.getElementById("errorMessage");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    setTimeout(() => { errorDiv.style.display = "none"; }, 5000);
  }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  initializeAuth();
});

// Export for HTML
window.firebaseMultiplayer = {
  registerUser,
  createRoom,
  joinRoom,
  leaveRoom,
  subscribeToRoom,
  subscribeToRoomsList,
  startGame,
  updatePlayerScore,
  finishGame,
  getCurrentUser: () => currentUser,
  getCurrentUsername: () => currentUsername,
  getCurrentRoomId: () => currentRoomId,
  setCurrentRoomId: (roomId) => { currentRoomId = roomId; }
};
