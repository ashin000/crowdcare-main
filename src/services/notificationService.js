import { 
  getNotifications, 
  createNotification, 
  markNotificationRead 
} from "../firebase/firestore";

export const notificationService = {
  getNotifications,
  createNotification,
  markNotificationRead
};

export default notificationService;
