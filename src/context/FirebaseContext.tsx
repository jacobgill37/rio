import { firebaseAppName, firebaseConfig } from "@/src/constants/firebaseConstants";
import firebase from "firebase/compat/app";
import { createContext, useContext, type FC, type ReactNode } from "react";

const FirebaseContext = createContext<firebase.app.App | null>(null);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

export const FirebaseProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const firebaseApp = firebase.apps.length
    ? firebase.app(firebaseAppName)
    : firebase.initializeApp(firebaseConfig, firebaseAppName);

  return (
    <FirebaseContext.Provider value={firebaseApp}>
      {children}
    </FirebaseContext.Provider>
  );
};
