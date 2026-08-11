import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config";

// Helper function to calculate distance between two coordinates in km (Haversine formula)
const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in km
  return d;
};

// --- MOCK DATABASE SEED & LOCAL STORAGE ---
const getMockData = (key, seed = []) => {
  const cached = localStorage.getItem(`crowdcare_${key}`);
  if (!cached) {
    localStorage.setItem(`crowdcare_${key}`, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(cached);
};

const saveMockData = (key, data) => {
  localStorage.setItem(`crowdcare_${key}`, JSON.stringify(data));
};

// Seed lists
const SEED_CATEGORIES = [
  { id: "pothole", name: "Pothole", description: "Dangerous road cavities causing traffic risk", icon: "🕳️" },
  { id: "waste", name: "Waste/Garbage", description: "Overflowing trash bins or illegal dumps", icon: "🗑️" },
  { id: "streetlight", name: "Streetlight", description: "Broken or non-functioning street lighting", icon: "⚡" },
  { id: "water", name: "Water Leakage", description: "Burst water mains or leaking pipes", icon: "🚰" },
  { id: "drainage", name: "Drainage", description: "Blocked sewage or open storm drains", icon: "🌊" },
  { id: "road", name: "Road Damage", description: "Cracks, lane collapses, or broken speed bumps", icon: "🛣️" },
  { id: "traffic", name: "Traffic", description: "Signage blocking or light sequencing faults", icon: "🚥" },
  { id: "safety", name: "Public Safety", description: "Hanging electrical wires or stray animals", icon: "🛡️" },
  { id: "infrastructure", name: "Public Infrastructure", description: "Broken parks, damaged bus shelters, or footpaths", icon: "🏫" },
  { id: "sanitation", name: "Sanitation", description: "Dirty public facilities or clogged public toilets", icon: "🧼" },
  { id: "other", name: "Other", description: "Other general community issue", icon: "ℹ️" }
];

const SEED_ISSUES = [
  {
    id: "CC-2026-000001",
    issueId: "CC-2026-000001",
    title: "Large pothole on Mount Road",
    description: "There is a massive pothole in the middle of the road near the metro station. It is causing scooter accidents at night and creating traffic pileups.",
    category: "pothole",
    reportedBy: "citizen-demo",
    reporterName: "Citizen Demo",
    reporterEmail: "citizen@crowdcare.demo",
    location: { latitude: 13.0401, longitude: 80.2415, address: "Mount Road, near Metro Gate 2", city: "Chennai", district: "Chennai", state: "Tamil Nadu" },
    media: [{ type: "image", url: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=800" }],
    status: "in_progress",
    priority: "high",
    assignedAuthorityId: "authority-demo",
    assignedVolunteerId: null,
    upvoteCount: 18,
    commentCount: 2,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    resolutionProof: [],
    tags: ["road-safety"],
    isPublic: true,
    isSpam: false,
    isDeleted: false
  },
  {
    id: "CC-2026-000002",
    issueId: "CC-2026-000002",
    title: "Overflowing garbage dump in T-Nagar",
    description: "The municipal garbage bin has not been cleared for over five days. Trash is scattered on the footpath and stray animals are creating a mess. Foul smell is spreading.",
    category: "waste",
    reportedBy: "citizen-demo",
    reporterName: "Citizen Demo",
    reporterEmail: "citizen@crowdcare.demo",
    location: { latitude: 13.0305, longitude: 80.2320, address: "T-Nagar Market Square, Main Street", city: "Chennai", district: "Chennai", state: "Tamil Nadu" },
    media: [{ type: "image", url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800" }],
    status: "pending",
    priority: "medium",
    assignedAuthorityId: null,
    assignedVolunteerId: null,
    upvoteCount: 4,
    commentCount: 0,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
    resolutionProof: [],
    tags: [],
    isPublic: true,
    isSpam: false,
    isDeleted: false
  }
];

const SEED_COMMENTS = [
  { id: "c1", userId: "volunteer-demo", userName: "Volunteer Hero", role: "volunteer", message: "I inspected this yesterday. The pothole is indeed very deep and needs cold asphalt mix.", isOfficial: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "c2", userId: "citizen-demo", userName: "Citizen Demo", role: "citizen", message: "Thank you for looking into this, please fix it soon!", isOfficial: false, createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString() }
];

const SEED_STATUS_HISTORY = [
  { status: "pending", changedBy: "citizen-demo", changedByRole: "citizen", comment: "Issue submitted by citizen.", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { status: "acknowledged", changedBy: "authority-demo", changedByRole: "authority", comment: "Municipal engineer acknowledged the report.", createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString() },
  { status: "in_progress", changedBy: "authority-demo", changedByRole: "authority", comment: "Roads department crew has been scheduled for repaving.", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
];

const SEED_POLLS = [
  {
    id: "poll-1",
    title: "Prioritize Ward 4 Civic Funds",
    description: "Which project should the corporation prioritize for the upcoming local development fund?",
    options: ["Pothole patching (Mount Road)", "New park streetlights", "Clogging drainage repairs", "Public market waste bins"],
    votes: { 0: 42, 1: 15, 2: 38, 3: 12 },
    voters: { "citizen-demo": 0 },
    createdBy: "admin-demo",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  }
];

const SEED_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    title: "Water Shutdown Notice",
    content: "Scheduled water pipe repairs will take place in Ward 4 on August 15th, 2026. Water supply will be unavailable from 9:00 AM to 5:00 PM.",
    category: "maintenance",
    date: new Date().toISOString(),
    targetArea: "Ward 4, Chennai",
    createdBy: "authority-demo",
    officialName: "Authority Officer",
    createdAt: new Date().toISOString()
  }
];

// Load mock stores
let mockIssues = getMockData("issues", SEED_ISSUES);
let mockCategories = getMockData("categories", SEED_CATEGORIES);
let mockComments = getMockData("comments_CC-2026-000001", SEED_COMMENTS);
let mockStatusHist = getMockData("history_CC-2026-000001", SEED_STATUS_HISTORY);
let mockPolls = getMockData("polls", SEED_POLLS);
let mockAnnouncements = getMockData("announcements", SEED_ANNOUNCEMENTS);
let mockNotifications = getMockData("notifications_citizen-demo", []);
let mockAuditLogs = getMockData("audit_logs", []);

// --- GENERAL DATABASE OPERATIONS ---

export const getCategories = async () => {
  if (isFirebaseConfigured) {
    const querySnapshot = await getDocs(collection(db, "categories"));
    if (querySnapshot.empty) {
      // Seed categories in firestore if empty
      for (const cat of SEED_CATEGORIES) {
        await setDoc(doc(db, "categories", cat.id), cat);
      }
      return SEED_CATEGORIES;
    }
    return querySnapshot.docs.map(doc => doc.data());
  } else {
    return mockCategories;
  }
};

export const getIssues = async () => {
  if (isFirebaseConfigured) {
    const q = query(collection(db, "issues"), where("isDeleted", "==", false), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    return mockIssues.filter(i => !i.isDeleted).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

export const getIssueById = async (id) => {
  if (isFirebaseConfigured) {
    const docSnap = await getDoc(doc(db, "issues", id));
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } else {
    const issue = mockIssues.find(i => i.id === id);
    return issue || null;
  }
};

// Check duplicate: category + coordinates within 1.5km + same category
export const checkDuplicateIssue = async (category, latitude, longitude) => {
  const issues = await getIssues();
  const duplicate = issues.find(iss => {
    if (iss.category !== category) return false;
    const dist = getDistance(
      latitude, 
      longitude, 
      iss.location?.latitude, 
      iss.location?.longitude
    );
    // Duplicate threshold: within 1.5 km
    return dist < 1.5 && ["pending", "acknowledged", "in_progress"].includes(iss.status);
  });
  return duplicate || null;
};

// Submission
export const createIssue = async (issueData, currentUser) => {
  // Generate issue sequence ID
  const issues = await getIssues();
  const sequence = String(issues.length + 1).padStart(6, "0");
  const year = new Date().getFullYear();
  const issueId = `CC-${year}-${sequence}`;

  const newIssue = {
    id: issueId,
    issueId,
    title: issueData.title,
    description: issueData.description,
    category: issueData.category,
    categoryName: SEED_CATEGORIES.find(c => c.id === issueData.category)?.name || "Other",
    reportedBy: currentUser.uid,
    reporterName: currentUser.name || currentUser.fullName || "Verified Citizen",
    reporterEmail: currentUser.email || "",
    location: {
      latitude: issueData.latitude,
      longitude: issueData.longitude,
      address: issueData.address || "",
      city: issueData.city || "",
      district: issueData.district || "",
      state: issueData.state || ""
    },
    media: issueData.imageUrl ? [{ type: "image", url: issueData.imageUrl }] : [],
    status: "pending",
    priority: issueData.priority || "medium",
    assignedAuthorityId: null,
    assignedVolunteerId: null,
    upvoteCount: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolvedAt: null,
    resolutionProof: [],
    tags: [],
    isPublic: true,
    isSpam: false,
    isDeleted: false
  };

  const initialStatusRecord = {
    status: "pending",
    changedBy: currentUser.uid,
    changedByRole: currentUser.role || "citizen",
    comment: "Issue reported on portal.",
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    // Save document
    await setDoc(doc(db, "issues", issueId), newIssue);
    // Add to subcollection statusHistory
    await setDoc(doc(db, "issues", issueId, "statusHistory", "initial"), initialStatusRecord);
    
    // Create notifications for admins in background
    await createNotification(
      "admin-demo", 
      "New Civic Issue Reported", 
      `Issue ${issueId} (${newIssue.title}) has been reported.`,
      "issue_submitted",
      issueId
    );

    return newIssue;
  } else {
    // Mock database update
    mockIssues.push(newIssue);
    saveMockData("issues", mockIssues);

    // Save comments/status history mocks
    saveMockData(`history_${issueId}`, [initialStatusRecord]);
    saveMockData(`comments_${issueId}`, []);

    // Push notification to mock notifications
    await createNotification(
      "admin-demo", 
      "New Civic Issue Reported", 
      `Issue ${issueId} (${newIssue.title}) has been reported.`,
      "issue_submitted",
      issueId
    );

    return newIssue;
  }
};

// Upvote Issue with transaction
export const upvoteIssue = async (issueId, userId) => {
  if (isFirebaseConfigured) {
    const upvoteDocRef = doc(db, "issues", issueId, "upvotes", userId);
    const issueDocRef = doc(db, "issues", issueId);

    return runTransaction(db, async (transaction) => {
      const upvoteDoc = await transaction.get(upvoteDocRef);
      const issueDoc = await transaction.get(issueDocRef);
      if (!issueDoc.exists()) throw new Error("Issue does not exist.");

      const currentCount = issueDoc.data().upvoteCount || 0;

      if (upvoteDoc.exists()) {
        // Remove upvote
        transaction.delete(upvoteDocRef);
        transaction.update(issueDocRef, { 
          upvoteCount: Math.max(0, currentCount - 1),
          updatedAt: new Date().toISOString()
        });
        return { upvoted: false, count: Math.max(0, currentCount - 1) };
      } else {
        // Add upvote
        transaction.set(upvoteDocRef, { userId, createdAt: new Date().toISOString() });
        transaction.update(issueDocRef, { 
          upvoteCount: currentCount + 1,
          updatedAt: new Date().toISOString()
        });
        return { upvoted: true, count: currentCount + 1 };
      }
    });
  } else {
    // Mock Transaction
    const idx = mockIssues.findIndex(i => i.id === issueId);
    if (idx === -1) throw new Error("Issue not found");
    
    let issue = mockIssues[idx];
    const upvoteKey = `upvoted_${issueId}_${userId}`;
    const alreadyUpvoted = localStorage.getItem(upvoteKey) === "true";

    if (alreadyUpvoted) {
      localStorage.removeItem(upvoteKey);
      issue.upvoteCount = Math.max(0, issue.upvoteCount - 1);
      mockIssues[idx] = issue;
      saveMockData("issues", mockIssues);
      return { upvoted: false, count: issue.upvoteCount };
    } else {
      localStorage.setItem(upvoteKey, "true");
      issue.upvoteCount = (issue.upvoteCount || 0) + 1;
      mockIssues[idx] = issue;
      saveMockData("issues", mockIssues);
      return { upvoted: true, count: issue.upvoteCount };
    }
  }
};

export const incrementViewCount = async (issueId) => {
  if (isFirebaseConfigured) {
    const issueRef = doc(db, "issues", issueId);
    const docSnap = await getDoc(issueRef);
    if (docSnap.exists()) {
      await updateDoc(issueRef, { viewsCount: (docSnap.data().viewsCount || 0) + 1 });
    }
  }
};

// Fetch Status History
export const getStatusHistory = async (issueId) => {
  if (isFirebaseConfigured) {
    const querySnapshot = await getDocs(collection(db, "issues", issueId, "statusHistory"));
    return querySnapshot.docs
      .map(doc => doc.data())
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else {
    return getMockData(`history_${issueId}`, SEED_STATUS_HISTORY);
  }
};

// Status adjustment
export const updateIssueStatus = async (issueId, status, comment, official) => {
  const statusRecord = {
    status,
    changedBy: official.uid,
    changedByRole: official.role,
    comment,
    createdAt: new Date().toISOString()
  };

  const updateFields = {
    status,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    const issueRef = doc(db, "issues", issueId);
    const docSnap = await getDoc(issueRef);
    const prevStatus = docSnap.exists() ? docSnap.data().status : "unknown";

    await updateDoc(issueRef, updateFields);
    await addDoc(collection(db, "issues", issueId, "statusHistory"), statusRecord);
    
    // Write Audit Log
    await writeAuditLog("STATUS_CHANGED", official.uid, official.role, issueId, prevStatus, status);

    // Notify Reporter
    if (docSnap.exists()) {
      const reporterId = docSnap.data().reportedBy;
      await createNotification(
        reporterId, 
        `Issue Status: ${status.toUpperCase().replace("_", " ")}`, 
        `Your reported issue ${issueId} has been updated to ${status.toUpperCase().replace("_", " ")}.`,
        "status_changed",
        issueId
      );
    }
  } else {
    const idx = mockIssues.findIndex(i => i.id === issueId);
    if (idx !== -1) {
      const prevStatus = mockIssues[idx].status;
      mockIssues[idx] = { ...mockIssues[idx], ...updateFields };
      saveMockData("issues", mockIssues);

      // Save history
      const history = getMockData(`history_${issueId}`);
      history.push(statusRecord);
      saveMockData(`history_${issueId}`, history);

      // Audit Log
      await writeAuditLog("STATUS_CHANGED", official.uid, official.role, issueId, prevStatus, status);

      // Notify
      await createNotification(
        mockIssues[idx].reportedBy, 
        `Issue Status: ${status.toUpperCase().replace("_", " ")}`, 
        `Your reported issue ${issueId} has been updated to ${status.toUpperCase().replace("_", " ")}.`,
        "status_changed",
        issueId
      );
    }
  }
};

// Delegation
export const assignIssue = async (issueId, assigneeId, assigneeRole, official) => {
  const updateFields = {};
  let commentMsg = "";

  if (assigneeRole === "authority" || assigneeRole === "official") {
    updateFields.assignedAuthorityId = assigneeId;
    commentMsg = `Issue assigned to authority officer.`;
  } else if (assigneeRole === "volunteer") {
    updateFields.assignedVolunteerId = assigneeId;
    commentMsg = `Issue delegated to field volunteer.`;
  }

  const statusRecord = {
    status: "acknowledged", // moves to acknowledged upon assignment
    changedBy: official.uid,
    changedByRole: official.role,
    comment: commentMsg,
    createdAt: new Date().toISOString()
  };

  updateFields.status = "acknowledged";
  updateFields.updatedAt = new Date().toISOString();

  if (isFirebaseConfigured) {
    const issueRef = doc(db, "issues", issueId);
    await updateDoc(issueRef, updateFields);
    await addDoc(collection(db, "issues", issueId, "statusHistory"), statusRecord);

    await writeAuditLog("ISSUE_ASSIGNED", official.uid, official.role, issueId, "unassigned", assigneeId);
    
    // Notify assignee
    await createNotification(
      assigneeId,
      "New Ticket Assigned",
      `You have been assigned issue ${issueId}. Please review details.`,
      "issue_assigned",
      issueId
    );
  } else {
    const idx = mockIssues.findIndex(i => i.id === issueId);
    if (idx !== -1) {
      mockIssues[idx] = { ...mockIssues[idx], ...updateFields };
      saveMockData("issues", mockIssues);

      const history = getMockData(`history_${issueId}`);
      history.push(statusRecord);
      saveMockData(`history_${issueId}`, history);

      await writeAuditLog("ISSUE_ASSIGNED", official.uid, official.role, issueId, "unassigned", assigneeId);

      await createNotification(
        assigneeId,
        "New Ticket Assigned",
        `You have been assigned issue ${issueId}. Please review details.`,
        "issue_assigned",
        issueId
      );
    }
  }
};

// Resolution Proof uploading
export const resolveIssue = async (issueId, description, afterImageUrl, official) => {
  const statusRecord = {
    status: "resolved",
    changedBy: official.uid,
    changedByRole: official.role,
    comment: `Issue marked as resolved. Proof: ${description}`,
    createdAt: new Date().toISOString()
  };

  const updateFields = {
    status: "resolved",
    resolvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolutionProof: [{
      description,
      imageUrl: afterImageUrl || "",
      resolvedBy: official.name || "Officer",
      resolvedAt: new Date().toISOString()
    }]
  };

  if (isFirebaseConfigured) {
    const issueRef = doc(db, "issues", issueId);
    const docSnap = await getDoc(issueRef);

    await updateDoc(issueRef, updateFields);
    await addDoc(collection(db, "issues", issueId, "statusHistory"), statusRecord);

    await writeAuditLog("ISSUE_RESOLVED", official.uid, official.role, issueId, "in_progress", "resolved");

    if (docSnap.exists()) {
      await createNotification(
        docSnap.data().reportedBy,
        "Issue Resolved Successfully 🎉",
        `Your reported issue ${issueId} has been successfully resolved. Thank you for your civic contribution!`,
        "status_changed",
        issueId
      );
    }
  } else {
    const idx = mockIssues.findIndex(i => i.id === issueId);
    if (idx !== -1) {
      mockIssues[idx] = { ...mockIssues[idx], ...updateFields };
      saveMockData("issues", mockIssues);

      const history = getMockData(`history_${issueId}`);
      history.push(statusRecord);
      saveMockData(`history_${issueId}`, history);

      await writeAuditLog("ISSUE_RESOLVED", official.uid, official.role, issueId, "in_progress", "resolved");

      await createNotification(
        mockIssues[idx].reportedBy,
        "Issue Resolved Successfully 🎉",
        `Your reported issue ${issueId} has been successfully resolved. Thank you for your civic contribution!`,
        "status_changed",
        issueId
      );
    }
  }
};

export const deleteIssue = async (issueId, actor) => {
  if (isFirebaseConfigured) {
    await updateDoc(doc(db, "issues", issueId), { isDeleted: true, updatedAt: new Date().toISOString() });
    await writeAuditLog("ISSUE_DELETED", actor.uid, actor.role, issueId, "active", "deleted");
  } else {
    const idx = mockIssues.findIndex(i => i.id === issueId);
    if (idx !== -1) {
      mockIssues[idx].isDeleted = true;
      saveMockData("issues", mockIssues);
      await writeAuditLog("ISSUE_DELETED", actor.uid, actor.role, issueId, "active", "deleted");
    }
  }
};

export const markSpam = async (issueId, isSpam, actor) => {
  if (isFirebaseConfigured) {
    await updateDoc(doc(db, "issues", issueId), { isSpam, updatedAt: new Date().toISOString() });
    await writeAuditLog("ISSUE_SPAM_FLAGGED", actor.uid, actor.role, issueId, String(!isSpam), String(isSpam));
  } else {
    const idx = mockIssues.findIndex(i => i.id === issueId);
    if (idx !== -1) {
      mockIssues[idx].isSpam = isSpam;
      saveMockData("issues", mockIssues);
      await writeAuditLog("ISSUE_SPAM_FLAGGED", actor.uid, actor.role, issueId, String(!isSpam), String(isSpam));
    }
  }
};

// --- COMMENTS ---

export const getComments = async (issueId) => {
  if (isFirebaseConfigured) {
    const q = query(collection(db, "issues", issueId, "comments"), orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    return getMockData(`comments_${issueId}`, SEED_COMMENTS);
  }
};

export const addComment = async (issueId, commentText, currentUser) => {
  const newComment = {
    userId: currentUser.uid,
    userName: currentUser.name || currentUser.fullName || "User",
    role: currentUser.role || "citizen",
    message: commentText,
    isOfficial: ["authority", "admin", "official"].includes(currentUser.role),
    isDeleted: false,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    const commentRef = await addDoc(collection(db, "issues", issueId, "comments"), newComment);
    
    // Increment comment count on issue using basic update (normally transaction is preferred, but simple update is fine here)
    const issueRef = doc(db, "issues", issueId);
    const docSnap = await getDoc(issueRef);
    if (docSnap.exists()) {
      await updateDoc(issueRef, { commentCount: (docSnap.data().commentCount || 0) + 1 });
    }

    return { id: commentRef.id, ...newComment };
  } else {
    const comments = getMockData(`comments_${issueId}`);
    const id = `c-${Math.random().toString(36).substr(2, 9)}`;
    const addedComment = { id, ...newComment };
    comments.push(addedComment);
    saveMockData(`comments_${issueId}`, comments);

    // Update issue comment count
    const idx = mockIssues.findIndex(i => i.id === issueId);
    if (idx !== -1) {
      mockIssues[idx].commentCount = (mockIssues[idx].commentCount || 0) + 1;
      saveMockData("issues", mockIssues);
    }

    return addedComment;
  }
};

// --- ANNOUNCEMENTS ---

export const getAnnouncements = async () => {
  if (isFirebaseConfigured) {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    return mockAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

export const createAnnouncement = async (annData, official) => {
  const newAnn = {
    title: annData.title,
    content: annData.content,
    category: annData.category || "General Update",
    targetArea: annData.targetArea || "All Districts",
    createdBy: official.uid,
    officialName: official.name || official.fullName || "Municipal Office",
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    const annRef = await addDoc(collection(db, "announcements"), newAnn);
    
    // Audit Log
    await writeAuditLog("ANNOUNCEMENT_CREATED", official.uid, official.role, annRef.id, "", annData.title);
    
    return { id: annRef.id, ...newAnn };
  } else {
    const id = `ann-${Math.random().toString(36).substr(2, 9)}`;
    const added = { id, ...newAnn };
    mockAnnouncements.push(added);
    saveMockData("announcements", mockAnnouncements);

    await writeAuditLog("ANNOUNCEMENT_CREATED", official.uid, official.role, id, "", annData.title);
    return added;
  }
};

export const deleteAnnouncement = async (annId, actor) => {
  if (isFirebaseConfigured) {
    await deleteDoc(doc(db, "announcements", annId));
    await writeAuditLog("ANNOUNCEMENT_DELETED", actor.uid, actor.role, annId, "", "");
  } else {
    mockAnnouncements = mockAnnouncements.filter(a => a.id !== annId);
    saveMockData("announcements", mockAnnouncements);
    await writeAuditLog("ANNOUNCEMENT_DELETED", actor.uid, actor.role, annId, "", "");
  }
};

// --- POLLS ---

export const getPolls = async () => {
  if (isFirebaseConfigured) {
    const querySnapshot = await getDocs(collection(db, "polls"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    return mockPolls;
  }
};

export const createPoll = async (pollData, official) => {
  const votesInit = {};
  pollData.options.forEach((_, idx) => {
    votesInit[idx] = 0;
  });

  const newPoll = {
    title: pollData.title,
    description: pollData.description || "",
    options: pollData.options,
    votes: votesInit,
    voters: {},
    createdBy: official.uid,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  };

  if (isFirebaseConfigured) {
    const pollRef = await addDoc(collection(db, "polls"), newPoll);
    
    await writeAuditLog("POLL_LAUNCHED", official.uid, official.role, pollRef.id, "", pollData.title);
    
    return { id: pollRef.id, ...newPoll };
  } else {
    const id = `poll-${Math.random().toString(36).substr(2, 9)}`;
    const added = { id, ...newPoll };
    mockPolls.push(added);
    saveMockData("polls", mockPolls);

    await writeAuditLog("POLL_LAUNCHED", official.uid, official.role, id, "", pollData.title);
    return added;
  }
};

export const voteInPoll = async (pollId, optionIndex, userId) => {
  if (isFirebaseConfigured) {
    const pollRef = doc(db, "polls", pollId);
    return runTransaction(db, async (transaction) => {
      const pollDoc = await transaction.get(pollRef);
      if (!pollDoc.exists()) throw new Error("Poll does not exist.");

      const voters = pollDoc.data().voters || {};
      const votes = pollDoc.data().votes || {};

      if (voters[userId] !== undefined) {
        throw new Error("You have already voted in this poll!");
      }

      voters[userId] = optionIndex;
      votes[optionIndex] = (votes[optionIndex] || 0) + 1;

      transaction.update(pollRef, { voters, votes });
      return { voters, votes };
    });
  } else {
    const idx = mockPolls.findIndex(p => p.id === pollId);
    if (idx === -1) throw new Error("Poll not found");

    const poll = mockPolls[idx];
    const voters = poll.voters || {};
    const votes = poll.votes || {};

    if (voters[userId] !== undefined) {
      throw new Error("You have already voted in this poll!");
    }

    voters[userId] = optionIndex;
    votes[optionIndex] = (votes[optionIndex] || 0) + 1;

    mockPolls[idx] = { ...poll, voters, votes };
    saveMockData("polls", mockPolls);
    return { voters, votes };
  }
};

export const deletePoll = async (pollId, actor) => {
  if (isFirebaseConfigured) {
    await deleteDoc(doc(db, "polls", pollId));
    await writeAuditLog("POLL_DELETED", actor.uid, actor.role, pollId, "", "");
  } else {
    mockPolls = mockPolls.filter(p => p.id !== pollId);
    saveMockData("polls", mockPolls);
    await writeAuditLog("POLL_DELETED", actor.uid, actor.role, pollId, "", "");
  }
};

// --- NOTIFICATIONS ---

export const getNotifications = async (userId) => {
  if (isFirebaseConfigured) {
    const q = query(
      collection(db, "notifications"), 
      where("userId", "==", userId), 
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    return getMockData(`notifications_${userId}`, []);
  }
};

export const createNotification = async (userId, title, message, type, issueId = null) => {
  const notif = {
    userId,
    title,
    message,
    type,
    issueId,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    await addDoc(collection(db, "notifications"), notif);
  } else {
    const notifs = getMockData(`notifications_${userId}`);
    notifs.unshift({ id: `notif-${Math.random().toString(36).substr(2, 9)}`, ...notif });
    saveMockData(`notifications_${userId}`, notifs);
  }
};

export const markNotificationRead = async (notifId) => {
  if (isFirebaseConfigured) {
    await updateDoc(doc(db, "notifications", notifId), { isRead: true });
  } else {
    // Find notification in localstorage tables
    // Iterate through all key values starting with notifications_
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("crowdcare_notifications_")) {
        const notifs = JSON.parse(localStorage.getItem(key));
        const idx = notifs.findIndex(n => n.id === notifId);
        if (idx !== -1) {
          notifs[idx].isRead = true;
          localStorage.setItem(key, JSON.stringify(notifs));
          break;
        }
      }
    }
  }
};

// --- USER PROFILES / AUDIT LOGGING ---

export const getUsers = async () => {
  if (isFirebaseConfigured) {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map(doc => doc.data());
  } else {
    return getMockData("users", [
      { uid: "citizen-demo", email: "citizen@crowdcare.demo", name: "Citizen Demo", role: "citizen", phone: "9876543210", address: "12 Main St", city: "Chennai", district: "Chennai", state: "Tamil Nadu", isVerified: true, identityVerification: { status: "verified", verifiedAt: new Date().toISOString(), providerReference: "demo-ref" }, createdAt: new Date().toISOString() },
      { uid: "authority-demo", email: "authority@crowdcare.demo", name: "Authority Officer", role: "authority", phone: "9876543211", department: "Roads & Infrastructure", address: "Municipal Corp Office", city: "Chennai", district: "Chennai", state: "Tamil Nadu", isVerified: true, identityVerification: { status: "verified", verifiedAt: new Date().toISOString(), providerReference: "demo-ref" }, createdAt: new Date().toISOString() },
      { uid: "volunteer-demo", email: "volunteer@crowdcare.demo", name: "Volunteer Hero", role: "volunteer", phone: "9876543212", address: "45 Side St", city: "Chennai", district: "Chennai", state: "Tamil Nadu", isVerified: true, identityVerification: { status: "verified", verifiedAt: new Date().toISOString(), providerReference: "demo-ref" }, createdAt: new Date().toISOString() },
      { uid: "admin-demo", email: "admin@crowdcare.demo", name: "System Administrator", role: "admin", phone: "9876543213", address: "Central Admin Block", city: "Chennai", district: "Chennai", state: "Tamil Nadu", isVerified: true, identityVerification: { status: "verified", verifiedAt: new Date().toISOString(), providerReference: "demo-ref" }, createdAt: new Date().toISOString() }
    ]);
  }
};

export const updateUserProfile = async (uid, data) => {
  const updateFields = {
    ...data,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    await updateDoc(doc(db, "users", uid), updateFields);
  } else {
    const users = getMockData("users");
    const idx = users.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updateFields };
      saveMockData("users", users);
      
      // Also update current active user if self
      const curr = JSON.parse(localStorage.getItem("crowdcare_current_user"));
      if (curr && curr.uid === uid) {
        localStorage.setItem("crowdcare_current_user", JSON.stringify(users[idx]));
      }
    }
  }
};

export const verifyUserIdentity = async (uid, referenceNumber) => {
  const verificationData = {
    identityVerification: {
      status: "verified",
      verifiedAt: new Date().toISOString(),
      providerReference: `aadhaar-verified-${referenceNumber.substr(-4)}`
    },
    isVerified: true
  };
  await updateUserProfile(uid, verificationData);
};

export const updateUserRole = async (uid, targetRole, department, status, admin) => {
  const updateFields = {
    updatedAt: new Date().toISOString()
  };

  if (status === "approved") {
    updateFields.role = targetRole;
    if (department) {
      updateFields.department = department;
    }
  }

  // Clear pending indicators
  updateFields.promotionStatus = status === "approved" ? "approved" : "rejected";
  updateFields.requestedRole = null;
  updateFields.requestedDept = null;

  if (isFirebaseConfigured) {
    await updateDoc(doc(db, "users", uid), updateFields);
    if (status === "approved") {
      await writeAuditLog("USER_ROLE_PROMOTED", admin.uid, admin.role, uid, "citizen", targetRole);
      await createNotification(uid, "Account Credential Approved", `An administrator has approved your application. Your role is now set to ${targetRole.toUpperCase()}.`, "role_updated");
    } else {
      await writeAuditLog("USER_ROLE_REJECTED", admin.uid, admin.role, uid, "citizen", "");
      await createNotification(uid, "Account Credential Rejected", `Your application for official credentials has been reviewed and declined.`, "role_updated");
    }
  } else {
    const users = getMockData("users");
    const idx = users.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updateFields };
      saveMockData("users", users);
      
      if (status === "approved") {
        await writeAuditLog("USER_ROLE_PROMOTED", admin.uid, admin.role, uid, "citizen", targetRole);
        await createNotification(uid, "Account Credential Approved", `An administrator has approved your application. Your role is now set to ${targetRole.toUpperCase()}.`, "role_updated");
      } else {
        await writeAuditLog("USER_ROLE_REJECTED", admin.uid, admin.role, uid, "citizen", "");
        await createNotification(uid, "Account Credential Rejected", `Your application for official credentials has been reviewed and declined.`, "role_updated");
      }
    }
  }
};

// --- AUDIT LOGS ---

export const getAuditLogs = async () => {
  if (isFirebaseConfigured) {
    const q = query(collection(db, "auditLogs"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } else {
    return mockAuditLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

export const writeAuditLog = async (action, actorId, actorRole, issueId, previousValue, newValue) => {
  const log = {
    action,
    actorId,
    actorRole,
    issueId,
    previousValue: previousValue || "",
    newValue: newValue || "",
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    await addDoc(collection(db, "auditLogs"), log);
  } else {
    mockAuditLogs.unshift({ id: `log-${Math.random().toString(36).substr(2, 9)}`, ...log });
    saveMockData("audit_logs", mockAuditLogs);
  }
};

export const seedAllCollections = async () => {
  if (isFirebaseConfigured) {
    // 1. Seed categories
    for (const cat of SEED_CATEGORIES) {
      await setDoc(doc(db, "categories", cat.id), cat);
    }
    // 2. Seed issues
    for (const iss of SEED_ISSUES) {
      await setDoc(doc(db, "issues", iss.id), iss);
      // Seed comments
      for (const comm of SEED_COMMENTS) {
        await setDoc(doc(db, "issues", iss.id, "comments", comm.id), comm);
      }
      // Seed status history
      for (const hist of SEED_STATUS_HISTORY) {
        const histId = `hist-${Math.random().toString(36).substr(2, 9)}`;
        await setDoc(doc(db, "issues", iss.id, "statusHistory", histId), hist);
      }
    }
    // 3. Seed polls
    for (const poll of SEED_POLLS) {
      await setDoc(doc(db, "polls", poll.id), poll);
    }
    // 4. Seed announcements
    for (const ann of SEED_ANNOUNCEMENTS) {
      await setDoc(doc(db, "announcements", ann.id), ann);
    }
  } else {
    localStorage.setItem("crowdcare_issues", JSON.stringify(SEED_ISSUES));
    localStorage.setItem("crowdcare_categories", JSON.stringify(SEED_CATEGORIES));
    localStorage.setItem("crowdcare_polls", JSON.stringify(SEED_POLLS));
    localStorage.setItem("crowdcare_announcements", JSON.stringify(SEED_ANNOUNCEMENTS));
    localStorage.setItem("crowdcare_comments_CC-2026-000001", JSON.stringify(SEED_COMMENTS));
    localStorage.setItem("crowdcare_history_CC-2026-000001", JSON.stringify(SEED_STATUS_HISTORY));
  }
};
