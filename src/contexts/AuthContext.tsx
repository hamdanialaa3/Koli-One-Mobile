// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserProfile, createUserProfile } from '../services/userService';
import { BulgarianUser } from '../types/user/bulgarian-user.types';

interface AuthContextType {
    user: User | null;
    profile: BulgarianUser | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null, // Initialize profile
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<BulgarianUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isActive = true;
        // Only set listener if auth is initialized successfully
        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, async (usr) => {
                if (!isActive) return;
                setUser(usr);
                if (usr) {
                    // Fetch existing profile
                    let userProfile = await getUserProfile(usr.uid);
                    if (!isActive) return;
                    // If no profile, create one (handles numeric ID generation)
                    if (!userProfile) {
                        userProfile = await createUserProfile(usr);
                    }
                    if (!isActive) return;
                    setProfile(userProfile);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            });
            return () => {
                isActive = false;
                unsubscribe();
            };
        } else {
            setLoading(false);
        }
    }, []);

    const signOut = async () => {
        if (auth) {
            await firebaseSignOut(auth);
            setProfile(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
