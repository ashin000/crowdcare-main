import { useState, useEffect } from "react";
import { getIssues, upvoteIssue } from "../firebase/firestore";

export default function useIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getIssues();
      setIssues(data);
    } catch (err) {
      setError(err.message || "Failed to load issues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const upvote = async (issueId, userId) => {
    try {
      const { count } = await upvoteIssue(issueId, userId);
      setIssues(prev => prev.map(iss => {
        if (iss.id === issueId) {
          return { ...iss, upvoteCount: count, upvotes: count };
        }
        return iss;
      }));
      return count;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    issues,
    loading,
    error,
    refetch: fetchIssues,
    upvote
  };
}
