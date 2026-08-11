// Firebase & Local Mock Service for CrowdCare
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, query, where, orderBy } from "firebase/firestore";

// Firebase configuration structure (loaded from environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if valid credentials are provided
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId
);

let db = null;
let fbAuth = null;
let useMock = true;
export let analytics = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    fbAuth = getAuth(app);
    if (firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
    useMock = false;
    console.log("🔥 Connected to Firebase successfully!");
  } catch (error) {
    console.error("Firebase failed to initialize. Falling back to Local Mock Database.", error);
    useMock = true;
  }
} else {
  console.log("ℹ️ No Firebase keys found. Running in Local Mock Database mode.");
  useMock = true;
}

// -------------------------------------------------------------
// LOCAL MOCK DATABASE IMPLEMENTATION
// -------------------------------------------------------------

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

const SEED_CATEGORIES = [
  { id: "cat-1", name: "Sanitation & Waste", description: "Garbage pileups, overflowing bins, drainage clogging", icon: "🗑️" },
  { id: "cat-2", name: "Roads & Potholes", description: "Potholes, broken footpaths, street signs damaged", icon: "🛣️" },
  { id: "cat-3", name: "Water & Sewage", description: "Water pipe bursts, sewage leaks, contaminated supply", icon: "🚰" },
  { id: "cat-4", name: "Electricity & Streetlights", description: "Broken streetlights, hanging live wires, load shedding", icon: "⚡" },
  { id: "cat-5", name: "Public Safety", description: "Stray animal issues, illegal parking, poor lighting", icon: "🛡️" }
];

const SEED_USERS = [
  { uid: "user-citizen-1", email: "citizen@example.com", name: "Ashwin Kumar", role: "citizen", phone: "9876543210", address: "12 Main St", city: "Chennai", district: "Chennai", state: "Tamil Nadu", createdAt: new Date().toISOString() },
  { uid: "user-official-1", email: "official@example.com", name: "Officer Rajesh", role: "official", phone: "9876543222", department: "Roads & Infrastructure", address: "Municipal Corp", city: "Chennai", district: "Chennai", state: "Tamil Nadu", createdAt: new Date().toISOString() }
];

const SEED_ISSUES = [
  {
    id: "issue-1",
    issue_id: "ISSUE-B7A5C9FD",
    citizenId: "user-citizen-1",
    citizenName: "Ashwin Kumar",
    assignedOfficialId: "user-official-1",
    assignedOfficialName: "Officer Rajesh",
    categoryId: "cat-2",
    categoryName: "Roads & Potholes",
    title: "Large pothole in middle of Main Road",
    description: "There is a massive, dangerous pothole near the intersection. It's causing severe traffic jams and has already damaged three scooters. Needs urgent patching.",
    location: "Main Road Intersection, near Central Library",
    latitude: 13.0827,
    longitude: 80.2707,
    status: "in_progress",
    priority: "high",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800&auto=format&fit=crop&q=60",
    videoUrl: "",
    reportedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    viewsCount: 42,
    upvotes: 18,
    upvotedBy: ["user-official-1"]
  },
  {
    id: "issue-2",
    issue_id: "ISSUE-C42E8102",
    citizenId: "user-citizen-1",
    citizenName: "Ashwin Kumar",
    assignedOfficialId: null,
    assignedOfficialName: null,
    categoryId: "cat-1",
    categoryName: "Sanitation & Waste",
    title: "Uncollected commercial garbage pileup",
    description: "Garbage bins at the local market haven't been cleared for over a week. The smell is unbearable and it is attracting street dogs and pests. Health hazard!",
    location: "Market Square Area, Ward 4",
    latitude: 13.0850,
    longitude: 80.2800,
    status: "reported",
    priority: "critical",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=60",
    videoUrl: "",
    reportedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    viewsCount: 15,
    upvotes: 9,
    upvotedBy: []
  }
];

const SEED_UPDATES = [
  {
    id: "update-1",
    issueId: "issue-1",
    officialId: "user-official-1",
    officialName: "Officer Rajesh",
    status: "acknowledged",
    description: "We have acknowledged the reported pothole. An inspection team has been scheduled for onsite assessment.",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "update-2",
    issueId: "issue-1",
    officialId: "user-official-1",
    officialName: "Officer Rajesh",
    status: "in_progress",
    description: "Contractor assigned. Repair team will fill the pothole and repave this section tonight.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_COMMENTS = [
  {
    id: "comment-1",
    issueId: "issue-1",
    userId: "user-citizen-1",
    userName: "Ashwin Kumar",
    userRole: "citizen",
    text: "Please get this done quickly. Two riders fell yesterday evening because it was raining.",
    isOfficial: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "comment-2",
    issueId: "issue-1",
    userId: "user-official-1",
    userName: "Officer Rajesh",
    userRole: "official",
    text: "Work has commenced. Roads department is on it.",
    isOfficial: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_POLLS = [
  {
    id: "poll-1",
    officialId: "user-official-1",
    officialName: "Officer Rajesh",
    title: "Where should the new municipal park be built?",
    description: "We are selecting between two sites for a recreational green space in our zone.",
    options: ["Sector 3 Empty Lot", "Sector 7 Lake Front"],
    votes: { 0: 24, 1: 52 },
    voters: { "user-citizen-1": 1 },
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    officialId: "user-official-1",
    officialName: "Officer Rajesh",
    title: "Scheduled Water Supply Shutdown - Aug 15",
    content: "Please note that water supply will be suspended in Wards 3, 4, and 5 on August 15 from 9:00 AM to 5:00 PM due to pipeline maintenance. Please store water in advance.",
    isPublished: true,
    createdAt: new Date().toISOString()
  }
];

const SEED_NOTIFICATIONS = [
  {
    id: "notif-1",
    userId: "user-citizen-1",
    type: "status_change",
    title: "Issue Updated",
    message: "Your reported pothole issue has been marked as In Progress by Officer Rajesh.",
    relatedIssueId: "issue-1",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Load or initialize mock database in localStorage
const getMockData = (key, seed) => {
  const data = localStorage.getItem(`crowdcare_${key}`);
  if (!data) {
    localStorage.setItem(`crowdcare_${key}`, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(data);
};

const saveMockData = (key, data) => {
  localStorage.setItem(`crowdcare_${key}`, JSON.stringify(data));
};

let mockStore = {
  users: getMockData("users", SEED_USERS),
  categories: getMockData("categories", SEED_CATEGORIES),
  issues: getMockData("issues", SEED_ISSUES),
  updates: getMockData("updates", SEED_UPDATES),
  comments: getMockData("comments", SEED_COMMENTS),
  polls: getMockData("polls", SEED_POLLS),
  announcements: getMockData("announcements", SEED_ANNOUNCEMENTS),
  notifications: getMockData("notifications", SEED_NOTIFICATIONS),
  currentUser: JSON.parse(localStorage.getItem("crowdcare_current_user") || "null")
};

// -------------------------------------------------------------
// UNIFIED AUTH & DATABASE API WRAPPERS
// -------------------------------------------------------------

export const authService = {
  signUp: async (email, password, additionalInfo) => {
    await delay(500);
    if (!useMock) {
      const userCredential = await createUserWithEmailAndPassword(fbAuth, email, password);
      const uid = userCredential.user.uid;
      const userDoc = {
        uid,
        email,
        name: additionalInfo.name,
        role: additionalInfo.role,
        phone: additionalInfo.phone || "",
        address: additionalInfo.address || "",
        city: additionalInfo.city || "",
        district: additionalInfo.district || "",
        state: additionalInfo.state || "",
        department: additionalInfo.department || "",
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, "users", uid), userDoc);
      return userDoc;
    } else {
      const exists = mockStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) throw new Error("Email already registered!");
      
      const newUser = {
        uid: `user-${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: additionalInfo.name,
        role: additionalInfo.role,
        phone: additionalInfo.phone || "",
        address: additionalInfo.address || "",
        city: additionalInfo.city || "",
        district: additionalInfo.district || "",
        state: additionalInfo.state || "",
        department: additionalInfo.department || "",
        createdAt: new Date().toISOString()
      };
      
      mockStore.users.push(newUser);
      saveMockData("users", mockStore.users);
      mockStore.currentUser = newUser;
      localStorage.setItem("crowdcare_current_user", JSON.stringify(newUser));
      return newUser;
    }
  },

  signIn: async (email, password) => {
    await delay(500);
    if (!useMock) {
      const userCredential = await signInWithEmailAndPassword(fbAuth, email, password);
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        throw new Error("User record not found in database.");
      }
    } else {
      const user = mockStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) throw new Error("User not found!");
      // Simple mock password validation (allow Admin@123456 or match role naming)
      if (password !== "Admin@123456" && password.length < 6) {
        throw new Error("Invalid credentials!");
      }
      
      mockStore.currentUser = user;
      localStorage.setItem("crowdcare_current_user", JSON.stringify(user));
      return user;
    }
  },

  signOut: async () => {
    await delay(300);
    if (!useMock) {
      await fbSignOut(fbAuth);
    } else {
      mockStore.currentUser = null;
      localStorage.removeItem("crowdcare_current_user");
    }
  },

  getCurrentUser: () => {
    return mockStore.currentUser;
  },

  subscribeAuthState: (callback) => {
    if (!useMock) {
      return onAuthStateChanged(fbAuth, async (fbUser) => {
        if (fbUser) {
          const userDocRef = doc(db, "users", fbUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            callback(docSnap.data());
          } else {
            callback(null);
          }
        } else {
          callback(null);
        }
      });
    } else {
      callback(mockStore.currentUser);
      return () => {}; // No-op cleanup
    }
  }
};

export const dbService = {
  getCategories: async () => {
    if (!useMock) {
      const q = query(collection(db, "categories"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return mockStore.categories;
  },

  getIssues: async () => {
    await delay(400);
    if (!useMock) {
      const q = query(collection(db, "issues"), orderBy("reportedAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    // Deep clone issues & sort
    return [...mockStore.issues].sort((a,b) => new Date(b.reportedAt) - new Date(a.reportedAt));
  },

  createIssue: async (issueData, citizen) => {
    await delay(600);
    const id = `issue-${Math.random().toString(36).substr(2, 9)}`;
    const issue_id = `ISSUE-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    const newIssue = {
      id,
      issue_id,
      citizenId: citizen.uid,
      citizenName: citizen.name,
      assignedOfficialId: null,
      assignedOfficialName: null,
      categoryId: issueData.categoryId,
      categoryName: mockStore.categories.find(c => c.id === issueData.categoryId)?.name || "Other",
      title: issueData.title,
      description: issueData.description,
      location: issueData.location,
      latitude: issueData.latitude || null,
      longitude: issueData.longitude || null,
      status: "reported",
      priority: issueData.priority || "medium",
      imageUrl: issueData.imageUrl || "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=800&auto=format&fit=crop&q=60",
      videoUrl: issueData.videoUrl || "",
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      viewsCount: 0,
      upvotes: 0,
      upvotedBy: []
    };

    if (!useMock) {
      await setDoc(doc(db, "issues", id), newIssue);
      return newIssue;
    } else {
      mockStore.issues.push(newIssue);
      saveMockData("issues", mockStore.issues);
      return newIssue;
    }
  },

  upvoteIssue: async (issueId, userUid) => {
    await delay(200);
    if (!useMock) {
      const docRef = doc(db, "issues", issueId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const issue = docSnap.data();
        let upvotedBy = issue.upvotedBy || [];
        let upvotes = issue.upvotes || 0;
        
        if (upvotedBy.includes(userUid)) {
          upvotedBy = upvotedBy.filter(uid => uid !== userUid);
          upvotes = Math.max(0, upvotes - 1);
        } else {
          upvotedBy.push(userUid);
          upvotes += 1;
        }
        await updateDoc(docRef, { upvotes, upvotedBy });
        return { upvotes, upvotedBy };
      }
      throw new Error("Issue not found");
    } else {
      const idx = mockStore.issues.findIndex(i => i.id === issueId);
      if (idx !== -1) {
        let issue = mockStore.issues[idx];
        let upvotedBy = issue.upvotedBy || [];
        let upvotes = issue.upvotes || 0;
        
        if (upvotedBy.includes(userUid)) {
          upvotedBy = upvotedBy.filter(uid => uid !== userUid);
          upvotes = Math.max(0, upvotes - 1);
        } else {
          upvotedBy.push(userUid);
          upvotes += 1;
        }
        mockStore.issues[idx] = { ...issue, upvotes, upvotedBy };
        saveMockData("issues", mockStore.issues);
        return { upvotes, upvotedBy };
      }
      throw new Error("Issue not found");
    }
  },

  incrementViewCount: async (issueId) => {
    if (!useMock) {
      const docRef = doc(db, "issues", issueId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const count = (docSnap.data().viewsCount || 0) + 1;
        await updateDoc(docRef, { viewsCount: count });
      }
      return;
    }
    const idx = mockStore.issues.findIndex(i => i.id === issueId);
    if (idx !== -1) {
      mockStore.issues[idx].viewsCount += 1;
      saveMockData("issues", mockStore.issues);
    }
  },

  getIssueUpdates: async (issueId) => {
    if (!useMock) {
      const q = query(collection(db, "updates"), where("issueId", "==", issueId), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return mockStore.updates.filter(u => u.issueId === issueId).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  updateIssueStatus: async (issueId, status, description, official) => {
    await delay(500);
    const updateId = `update-${Math.random().toString(36).substr(2, 9)}`;
    const newUpdate = {
      id: updateId,
      issueId,
      officialId: official.uid,
      officialName: official.name,
      status,
      description,
      createdAt: new Date().toISOString()
    };

    if (!useMock) {
      // Add update history record
      await setDoc(doc(db, "updates", updateId), newUpdate);
      
      // Update primary issue status
      const issueRef = doc(db, "issues", issueId);
      const issueSnap = await getDoc(issueRef);
      if (issueSnap.exists()) {
        const updateObj = {
          status,
          assignedOfficialId: official.uid,
          assignedOfficialName: official.name,
          updatedAt: new Date().toISOString(),
          resolvedAt: status === "resolved" ? new Date().toISOString() : null
        };
        await updateDoc(issueRef, updateObj);
        
        // Notify citizen
        const citizenId = issueSnap.data().citizenId;
        const notifId = `notif-${Math.random().toString(36).substr(2, 9)}`;
        await setDoc(doc(db, "notifications", notifId), {
          id: notifId,
          userId: citizenId,
          type: "status_change",
          title: `Status: ${status.replace("_", " ")}`,
          message: `Officer ${official.name} updated your issue status to ${status.toUpperCase()}. Message: ${description}`,
          relatedIssueId: issueId,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      // Mock logic
      mockStore.updates.push(newUpdate);
      saveMockData("updates", mockStore.updates);

      const idx = mockStore.issues.findIndex(i => i.id === issueId);
      if (idx !== -1) {
        mockStore.issues[idx] = {
          ...mockStore.issues[idx],
          status,
          assignedOfficialId: official.uid,
          assignedOfficialName: official.name,
          updatedAt: new Date().toISOString(),
          resolvedAt: status === "resolved" ? new Date().toISOString() : null
        };
        saveMockData("issues", mockStore.issues);

        // Add Notification
        const notifId = `notif-${Math.random().toString(36).substr(2, 9)}`;
        mockStore.notifications.push({
          id: notifId,
          userId: mockStore.issues[idx].citizenId,
          type: "status_change",
          title: `Status: ${status.replace("_", " ")}`,
          message: `Officer ${official.name} updated your issue status to ${status.toUpperCase()}. Message: ${description}`,
          relatedIssueId: issueId,
          isRead: false,
          createdAt: new Date().toISOString()
        });
        saveMockData("notifications", mockStore.notifications);
      }
    }
  },

  getComments: async (issueId) => {
    if (!useMock) {
      const q = query(collection(db, "comments"), where("issueId", "==", issueId), orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return mockStore.comments.filter(c => c.issueId === issueId).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  addComment: async (issueId, commentText, user) => {
    await delay(300);
    const commentId = `comment-${Math.random().toString(36).substr(2, 9)}`;
    const newComment = {
      id: commentId,
      issueId,
      userId: user.uid,
      userName: user.name,
      userRole: user.role,
      text: commentText,
      isOfficial: user.role === "official",
      createdAt: new Date().toISOString()
    };

    if (!useMock) {
      await setDoc(doc(db, "comments", commentId), newComment);
      return newComment;
    } else {
      mockStore.comments.push(newComment);
      saveMockData("comments", mockStore.comments);
      return newComment;
    }
  },

  getAnnouncements: async () => {
    if (!useMock) {
      const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return [...mockStore.announcements].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createAnnouncement: async (annData, official) => {
    await delay(500);
    const id = `ann-${Math.random().toString(36).substr(2, 9)}`;
    const newAnn = {
      id,
      officialId: official.uid,
      officialName: official.name,
      title: annData.title,
      content: annData.content,
      isPublished: true,
      createdAt: new Date().toISOString()
    };

    if (!useMock) {
      await setDoc(doc(db, "announcements", id), newAnn);
      
      // Notify all users in Background (mocked by adding notifications)
      return newAnn;
    } else {
      mockStore.announcements.push(newAnn);
      saveMockData("announcements", mockStore.announcements);
      
      // Notify all citizens
      mockStore.users.forEach(u => {
        if (u.role === "citizen") {
          mockStore.notifications.push({
            id: `notif-${Math.random().toString(36).substr(2, 9)}`,
            userId: u.uid,
            type: "announcement",
            title: `New Announcement: ${annData.title}`,
            message: `Official ${official.name} posted a new update: "${annData.content.substring(0, 60)}..."`,
            relatedIssueId: null,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      });
      saveMockData("notifications", mockStore.notifications);
      return newAnn;
    }
  },

  getPolls: async () => {
    if (!useMock) {
      const q = query(collection(db, "polls"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return [...mockStore.polls].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  createPoll: async (pollData, official) => {
    await delay(500);
    const id = `poll-${Math.random().toString(36).substr(2, 9)}`;
    const votesInit = {};
    pollData.options.forEach((_, idx) => {
      votesInit[idx] = 0;
    });

    const newPoll = {
      id,
      officialId: official.uid,
      officialName: official.name,
      title: pollData.title,
      description: pollData.description || "",
      options: pollData.options,
      votes: votesInit,
      voters: {},
      isActive: true,
      createdAt: new Date().toISOString(),
      expiresAt: pollData.expiresAt || null
    };

    if (!useMock) {
      await setDoc(doc(db, "polls", id), newPoll);
      return newPoll;
    } else {
      mockStore.polls.push(newPoll);
      saveMockData("polls", mockStore.polls);

      // Notify citizens
      mockStore.users.forEach(u => {
        if (u.role === "citizen") {
          mockStore.notifications.push({
            id: `notif-${Math.random().toString(36).substr(2, 9)}`,
            userId: u.uid,
            type: "poll",
            title: `New Poll: ${pollData.title}`,
            message: `A new municipal priority poll has been created. Cast your vote now!`,
            relatedIssueId: null,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      });
      saveMockData("notifications", mockStore.notifications);
      return newPoll;
    }
  },

  voteInPoll: async (pollId, optionIndex, userUid) => {
    await delay(300);
    if (!useMock) {
      const docRef = doc(db, "polls", pollId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const poll = docSnap.data();
        const voters = poll.voters || {};
        const votes = poll.votes || {};

        if (voters[userUid] !== undefined) {
          throw new Error("You have already voted in this poll!");
        }

        voters[userUid] = optionIndex;
        votes[optionIndex] = (votes[optionIndex] || 0) + 1;
        await updateDoc(docRef, { voters, votes });
        return { voters, votes };
      }
      throw new Error("Poll not found");
    } else {
      const idx = mockStore.polls.findIndex(p => p.id === pollId);
      if (idx !== -1) {
        const poll = mockStore.polls[idx];
        const voters = poll.voters || {};
        const votes = poll.votes || {};

        if (voters[userUid] !== undefined) {
          throw new Error("You have already voted in this poll!");
        }

        voters[userUid] = optionIndex;
        votes[optionIndex] = (votes[optionIndex] || 0) + 1;

        mockStore.polls[idx] = { ...poll, voters, votes };
        saveMockData("polls", mockStore.polls);
        return { voters, votes };
      }
      throw new Error("Poll not found");
    }
  },

  getNotifications: async (userUid) => {
    if (!useMock) {
      const q = query(collection(db, "notifications"), where("userId", "==", userUid), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return mockStore.notifications.filter(n => n.userId === userUid).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  markNotificationRead: async (notifId) => {
    if (!useMock) {
      await updateDoc(doc(db, "notifications", notifId), { isRead: true });
      return;
    }
    const idx = mockStore.notifications.findIndex(n => n.id === notifId);
    if (idx !== -1) {
      mockStore.notifications[idx].isRead = true;
      saveMockData("notifications", mockStore.notifications);
    }
  }
};
