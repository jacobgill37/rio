import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import {
  createContext,
  useContext,
  useState,
  type FC,
  type ReactNode,
} from "react";
import SignIn from "../components/SignIn";
import { useFirebase } from "./FirebaseContext";

const AuthContext = createContext<{
  signIn: () => void;
  signOut: () => void;
}>({
  signIn: () => null,
  signOut: () => null,
});

export const useSession = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }

  return value;
};

export const SessionProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthUIVisible, setAuthUIVisible] = useState(false);
  const firebaseApp = useFirebase();
  const auth = firebase.auth(firebaseApp);

  auth.onAuthStateChanged((user) => {
    if (user) {
      setAuthUIVisible(false);
    } else {
      setAuthUIVisible(true);
    }
  });

  return (
    <AuthContext.Provider
      value={{
        signIn: () => {
          setAuthUIVisible(true);
        },
        signOut: async () => {
          await auth.signOut();
        },
      }}
    >
      {isAuthUIVisible ? <SignIn /> : children}
    </AuthContext.Provider>
  );
};
