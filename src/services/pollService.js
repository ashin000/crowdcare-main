import { 
  getPolls, 
  createPoll, 
  voteInPoll 
} from "../firebase/firestore";

export const pollService = {
  getPolls,
  createPoll,
  voteInPoll
};

export default pollService;
