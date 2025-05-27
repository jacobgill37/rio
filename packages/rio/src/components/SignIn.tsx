import { useFirebase } from "@/src/context/FirebaseContext";
import {
  AuthError,
  AuthErrorCodes,
  getAuth,
  PasswordValidationStatus,
  validatePassword,
} from "firebase/auth";
import "firebase/compat/auth";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { passwordValidationMessages } from "../constants/signInValidation";

type signInError = string | null;

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailError, setIsEmailError] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [signInError, setSignInError] = useState<signInError>(null);
  const [status, setStatus] = useState<PasswordValidationStatus | null>(null);
  const firebaseApp = useFirebase();
  const auth = getAuth(firebaseApp);

  const validateInput = async () => {
    const status = await validatePassword(auth, password);
    setStatus(status);
  };

  const handleSignInError = (error: AuthError) => {
    switch (error.code) {
      case AuthErrorCodes.INVALID_EMAIL:
        setSignInError("Invalid email address");
        setIsEmailError(true);
        break;
      case AuthErrorCodes.INVALID_PASSWORD:
        setSignInError("Sign in details are incorrect");
        setIsEmailError(true);
        setIsPasswordError(true);
        break;
      case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
        setSignInError("Sign in details are incorrect");
        setIsEmailError(true);
        setIsPasswordError(true);
        break;
      case AuthErrorCodes.EMAIL_EXISTS:
        setSignInError("Account already exists");
        setIsEmailError(true);
        break;
      default:
        setSignInError("An unknown error occurred");
    }
  };

  const handleSignIn = async () => {
    try {
      await firebaseApp.auth().signInWithEmailAndPassword(email, password);
    } catch (err: any) {
      handleSignInError(err);
    }
  };

  const handleSignUp = async () => {
    try {
      await firebaseApp.auth().createUserWithEmailAndPassword(email, password);
    } catch (err: any) {
      handleSignInError(err);
    }
  };

  useEffect(() => {
    if (password.length === 0) {
      setStatus(null);
      return;
    }
    validateInput();
  }, [password]);

  return (
    <ScrollView style={{ paddingHorizontal: 16, marginTop: "50%" }}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
        Sign In
      </Text>
      {signInError && (
        <>
          <Text>The following error occurred, please try again:</Text>
          <Text style={{ color: "red", marginBottom: 16 }}>{signInError}</Text>
        </>
      )}
      {status && (
        <View style={{ marginBottom: 16 }}>
          {Object.keys(status).map((key) => {
            const value = status[key as keyof PasswordValidationStatus];
            if (!value && key !== "isValid") {
              return (
                <Text style={{ color: "red" }} key={key}>
                  {
                    passwordValidationMessages[
                      key as keyof typeof passwordValidationMessages
                    ]
                  }
                </Text>
              );
            }
            return null;
          })}
        </View>
      )}
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        label="Email"
        textContentType="emailAddress"
        error={isEmailError}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        textContentType="password"
        secureTextEntry
        label="Password"
        style={{ marginTop: 8 }}
        error={isPasswordError}
      />
      <Button
        icon="login"
        onPress={handleSignIn}
        mode="contained"
        style={{ marginTop: 16 }}
      >
        Sign in
      </Button>
      <Text style={{ marginTop: 16 }}>No account? Click to sign up</Text>
      <Button
        icon="account-plus"
        onPress={handleSignUp}
        mode="contained"
        style={{ marginTop: 16 }}
      >
        Sign up
      </Button>
    </ScrollView>
  );
};

export default SignIn;
