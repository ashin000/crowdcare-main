import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, isFirebaseConfigured } from "./config";

export const validateFile = (file, type = "image") => {
  const maxSizeImage = 5 * 1024 * 1024; // 5 MB
  const maxSizeVideo = 50 * 1024 * 1024; // 50 MB

  if (!file) return { valid: false, error: "No file selected." };

  if (type === "image") {
    if (!file.type.startsWith("image/")) {
      return { valid: false, error: "Invalid file type. Please upload an image." };
    }
    if (file.size > maxSizeImage) {
      return { valid: false, error: "File too large. Maximum size allowed is 5 MB." };
    }
  } else if (type === "video") {
    if (!file.type.startsWith("video/")) {
      return { valid: false, error: "Invalid file type. Please upload a video." };
    }
    if (file.size > maxSizeVideo) {
      return { valid: false, error: "File too large. Maximum size allowed is 50 MB." };
    }
  }

  return { valid: true };
};

export const uploadMediaFile = async (folderPath, file) => {
  const validation = validateFile(file, file.type.startsWith("video/") ? "video" : "image");
  if (!validation.valid) throw new Error(validation.error);

  if (isFirebaseConfigured) {
    const filename = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `${folderPath}/${filename}`);
    
    // Upload bytes
    const snapshot = await uploadBytes(storageRef, file);
    // Get download URL
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } else {
    // Local Mock upload: generate object URL for local preview/session use
    return new Promise((resolve) => {
      setTimeout(() => {
        // Fallback to local Object URL
        const localUrl = URL.createObjectURL(file);
        resolve(localUrl);
      }, 1000);
    });
  }
};
