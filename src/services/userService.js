import { 
  getUsers, 
  updateUserProfile, 
  verifyUserIdentity, 
  updateUserRole 
} from "../firebase/firestore";

export const userService = {
  getUsers,
  updateUserProfile,
  verifyUserIdentity,
  updateUserRole
};

export default userService;
