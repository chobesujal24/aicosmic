import { useState, useEffect } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useToast } from './use-toast';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!auth) {
            console.warn("Firebase Auth is not initialized. Please check your .env file.");
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!auth || !googleProvider) {
            toast({
                title: "Authentication Unavailable",
                description: "Firebase is not configured. Please add your credentials.",
                variant: "destructive"
            });
            return;
        }
        try {
            setLoading(true);
            await signInWithPopup(auth, googleProvider);
            toast({
                title: "Welcome!",
                description: "Successfully signed in with Google.",
            });
        } catch (error: any) {
            console.error("Error signing in with Google", error);
            toast({
                title: "Sign in failed",
                description: error.message || "An error occurred during sign in.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
            toast({
                title: "Signed out",
                description: "You have been successfully signed out.",
            });
        } catch (error: any) {
            console.error("Error signing out", error);
            toast({
                title: "Sign out failed",
                description: "An error occurred while signing out.",
                variant: "destructive"
            });
        }
    };

    const signUpWithEmail = async (email: string, password: string, name?: string) => {
        if (!auth) {
            toast({
                title: "Authentication Unavailable",
                description: "Firebase is not configured.",
                variant: "destructive"
            });
            return;
        }
        try {
            setLoading(true);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (name) {
                await updateProfile(userCredential.user, { displayName: name });
            }
            toast({
                title: "Welcome!",
                description: "Account created successfully.",
            });
        } catch (error: any) {
            console.error("Error signing up", error);
            toast({
                title: "Sign up failed",
                description: error.message || "An error occurred during registration.",
                variant: "destructive"
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        if (!auth) {
            toast({
                title: "Authentication Unavailable",
                description: "Firebase is not configured.",
                variant: "destructive"
            });
            return;
        }
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: "Welcome back!",
                description: "Successfully signed in.",
            });
        } catch (error: any) {
            console.error("Error signing in", error);
            toast({
                title: "Sign in failed",
                description: error.message || "Invalid credentials.",
                variant: "destructive"
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, logout };
}
