import { 
  getIssues, 
  getIssueById, 
  createIssue, 
  upvoteIssue, 
  incrementViewCount, 
  getStatusHistory, 
  updateIssueStatus, 
  assignIssue, 
  resolveIssue, 
  deleteIssue,
  markSpam,
  checkDuplicateIssue
} from "../firebase/firestore";

export const issueService = {
  getIssues,
  getIssueById,
  createIssue,
  upvoteIssue,
  incrementViewCount,
  getStatusHistory,
  updateIssueStatus,
  assignIssue,
  resolveIssue,
  deleteIssue,
  markSpam,
  checkDuplicateIssue
};

export default issueService;
