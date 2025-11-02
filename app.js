async function initializeAuth() {
  try {
    // Restore session from localStorage if it exists
    const savedUser = localStorage.getItem('ptpUser');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      currentUsername = localStorage.getItem('ptpUsername');
      currentLink = localStorage.getItem('ptpLink');
      console.log("✓ Session restored from localStorage");
      return;
    }

    // Otherwise, sign in anonymously
    const result = await auth.signInAnonymously();
    currentUser = result.user;
    
    // Save to localStorage for persistence
    localStorage.setItem('ptpUser', JSON.stringify({uid: currentUser.uid}));
    
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
    
    // Save to localStorage
    localStorage.setItem('ptpUsername', username);
    localStorage.setItem('ptpLink', link);
    
    console.log("✓ User registered:", username);
    return true;
  } catch (error) {
    console.error("Registration error:", error);
    showError("Failed to register: " + error.message);
    return false;
  }
}
