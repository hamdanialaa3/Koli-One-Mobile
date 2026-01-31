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
        // Only set listener if auth is initialized successfully
        if (auth) {
            const unsubscribe = onAuthStateChanged(auth, async (usr) => {
                setUser(usr);
                if (usr) {
                    // Fetch existing profile
                    let userProfile = await getUserProfile(usr.uid);
                    // If no profile, create one (handles numeric ID generation)
                    if (!userProfile) {
                        userProfile = await createUserProfile(usr);
                    }
                    setProfile(userProfile);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            });
            return unsubscribe;
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
