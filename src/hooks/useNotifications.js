import { useState, useEffect } from "react";
import { getNotifications, markNotificationRead } from "../firebase/firestore";
import { useAuthContext } from "../context/AuthContext";

export default function useNotifications() {
  const { currentUser } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const list = await getNotifications(currentUser.uid);
      setNotifications(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    loading,
    unreadCount,
    refetch: fetchNotifications,
    markRead
  };
}
