import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./config";

// --- MOCK STORAGE FALLBACK FOR DEV/DEMO ---
const getMockUsers = () => {
  const cached = localStorage.getItem("crowdcare_users");
  return cached ? JSON.parse(cached) : [
    { uid: "citizen-demo", email: "citizen@crowdcare.demo", name: "Citizen Demo", role: "citizen", phone: "9876543210", address: "12 Main St", city: "Chennai", district: "Chennai", state: "Tamil Nadu", isVerified: true, identityVerification: { status: "verified", verifiedAt: new Date().toISOString(), providerReference: "demo-ref" }, createdAt: new Date().toISOString() },
    { uid: "authority-demo", email: "authority@crowdcare.demo", name: "Authority Officer", role: "authority", phone: "9876543211", department: "Roads & Infrastructure", address: "Municipal Corp Office", city: "Chennai", district: "Chennai", state: "Tamil Nadu", isVerified: true, identityVerification: { status: "verified", verifiedAt: new Date().toISOString(), providerReference: "demo-ref" }, createdAt: new Date().toISOString() },
    { uid: "volunteer-demo", email: "volunteer@crowdcare.demo", name: "Volunteer Hero", role: "volunteer", phone: "9876543212", address: "45 Side St", city: "Chennai", district: "Chennai", state: "Tamil Nadu", isVerified: true, identityVerification: { status: "verified", verifiedAt: new Date().toISOString(), providerReference: "demo-ref" }, createdAt: new Date().toISOString() },
    { uid: "admin-demo", email: "admin@crowdcare.demo", name: "System Administrator", role: "admin", phone: "9876543213", address: "Central Admin Block", city: "Chennai", district: "Chennai", state: "Tamil Nadu", isVerified: true, identityVerification: { status: "verified", verifiedAt: new Date().toISOString(), providerReference: "demo-ref" }, createdAt: new Date().toISOString() }
  ];
};

const saveMockUsers = (users) => {
  localStorage.setItem("crowdcare_users", JSON.stringify(users));
};

let currentMockUser = JSON.parse(localStorage.getItem("crowdcare_current_user") || "null");

export const registerWithEmail = async (email, password, additionalInfo) => {
  if (isFirebaseConfigured) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const userDoc = {
      uid,
      email,
      fullName: additionalInfo.fullName || additionalInfo.name || "",
      name: additionalInfo.fullName || additionalInfo.name || "", // support both fields
      phone: additionalInfo.phone || "",
      role: additionalInfo.role || "citizen", // Default role is citizen
      profileImage: additionalInfo.profileImage || "",
      address: additionalInfo.address || "",
      city: additionalInfo.city || "",
      district: additionalInfo.district || "",
      state: additionalInfo.state || "",
      isVerified: false,
      identityVerification: {
        status: "not_verified",
        verifiedAt: null,
        providerReference: null
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, "users", uid), userDoc);
    return userDoc;
  } else {
    // Mock Signup
    const users = getMockUsers();
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error("Email already registered!");

    const mockUser = {
      uid: `mock-${Math.random().toString(36).substr(2, 9)}`,
      email,
      fullName: additionalInfo.fullName || additionalInfo.name || "",
      name: additionalInfo.fullName || additionalInfo.name || "",
      phone: additionalInfo.phone || "",
      role: additionalInfo.role || "citizen",
      profileImage: "",
      address: additionalInfo.address || "",
      city: additionalInfo.city || "",
      district: additionalInfo.district || "",
      state: additionalInfo.state || "",
      isVerified: false,
      identityVerification: {
        status: "not_verified",
        verifiedAt: null,
        providerReference: null
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(mockUser);
    saveMockUsers(users);
    currentMockUser = mockUser;
    localStorage.setItem("crowdcare_current_user", JSON.stringify(mockUser));
    return mockUser;
  }
};

export const loginWithEmail = async (email, password) => {
  if (isFirebaseConfigured) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Create user profile if missing
      const fallbackProfile = {
        uid,
        email,
        name: email.split("@")[0],
        fullName: email.split("@")[0],
        role: "citizen",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, "users", uid), fallbackProfile);
      return fallbackProfile;
    }
  } else {
    // Mock Login
    const users = getMockUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error("User not found in demo database.");
    
    // Simple demo password check: allow any password of 6+ chars or standard passwords
    if (password.length < 6) throw new Error("Password must be at least 6 characters.");
    
    currentMockUser = user;
    localStorage.setItem("crowdcare_current_user", JSON.stringify(user));
    return user;
  }
};

export const loginWithGoogle = async () => {
  if (isFirebaseConfigured) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const uid = result.user.uid;
    const docSnap = await getDoc(doc(db, "users", uid));
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      const newUser = {
        uid,
        email: result.user.email,
        fullName: result.user.displayName || "",
        name: result.user.displayName || "",
        phone: result.user.phoneNumber || "",
        role: "citizen",
        profileImage: result.user.photoURL || "",
        address: "",
        city: "",
        district: "",
        state: "",
        isVerified: false,
        identityVerification: {
          status: "not_verified",
          verifiedAt: null,
          providerReference: null
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, "users", uid), newUser);
      return newUser;
    }
  } else {
    // Mock Google Login
    const mockGoogleUser = {
      uid: "mock-google-user",
      email: "googleuser@example.com",
      fullName: "Google Demo Citizen",
      name: "Google Demo Citizen",
      role: "citizen",
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60",
      isVerified: true,
      identityVerification: { status: "verified", verifiedAt: new Date().toISOString(), providerReference: "google-ref" },
      createdAt: new Date().toISOString()
    };
    currentMockUser = mockGoogleUser;
    localStorage.setItem("crowdcare_current_user", JSON.stringify(mockGoogleUser));
    return mockGoogleUser;
  }
};

export const logoutUser = async () => {
  if (isFirebaseConfigured) {
    await signOut(auth);
  } else {
    currentMockUser = null;
    localStorage.removeItem("crowdcare_current_user");
  }
};

export const resetPassword = async (email) => {
  if (isFirebaseConfigured) {
    await sendPasswordResetEmail(auth, email);
  } else {
    console.log(`Demo: Password reset email sent to ${email}`);
  }
};

export const subscribeToAuth = (callback) => {
  if (isFirebaseConfigured) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docSnap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (docSnap.exists()) {
          callback(docSnap.data());
        } else {
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: "citizen"
          });
        }
      } else {
        callback(null);
      }
    });
  } else {
    callback(currentMockUser);
    return () => {}; // return dummy unsubscribe
  }
};
