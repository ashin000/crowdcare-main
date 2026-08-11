import { 
  getAnnouncements, 
  createAnnouncement 
} from "../firebase/firestore";

export const announcementService = {
  getAnnouncements,
  createAnnouncement
};

export default announcementService;
