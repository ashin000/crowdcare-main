import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  logoutUser, 
  resetPassword,
  subscribeToAuth 
} from "../firebase/auth";

export const authService = {
  signIn: loginWithEmail,
  signUp: registerWithEmail,
  signInWithGoogle: loginWithGoogle,
  signOut: logoutUser,
  resetPassword,
  subscribeAuthState: subscribeToAuth,
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("crowdcare_current_user") || "null");
  }
};

export default authService;
