import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User, getCurrentUser } from '@/api/users';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const userData = await getCurrentUser(); // returns User | null
    setUser(userData);
    setLoading(false);
  };

  useEffect(() => {
    refreshUser(); // runs once on load
  }, []);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{ user, loading, setUser, refreshUser, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}


// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from 'react';
// import { User, getCurrentUser } from '@/api/users';

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   setUser: (user: User | null) => void;
//   refreshUser: () => Promise<void>;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   const refreshUser = async () => {
//     try {
//       const userData = await getCurrentUser(); // calls /api/users/me
//       setUser(userData);
//     } catch (error: any) {
//       if (error?.status === 401) {
//         setUser(null);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     refreshUser(); // run on first render
//   }, []);

//   const isAuthenticated = !!user;

//   return (
//     <AuthContext.Provider
//       value={{ user, loading, setUser, refreshUser, isAuthenticated }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }




// // import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// // import { User } from '@/api/users';
// // import { getCurrentUser } from '@/api/users';

// // interface AuthContextType {
// //   user: User | null;
// //   loading: boolean;
// //   setUser: (user: User | null) => void;
// //   refreshUser: () => Promise<void>;
// // }

// // const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // export function AuthProvider({ children }: { children: ReactNode }) {
// //   const [user, setUser] = useState<User | null>(null);
// //   const [loading, setLoading] = useState(true);

// //   const refreshUser = async () => {
// //     try {
// //       const userData = await getCurrentUser();
// //       setUser(userData);
// //     } catch (error: any) {
// //       if (error.status === 401) {
// //         setUser(null);
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     refreshUser();
// //   }, []);

// //   return (
// //     <AuthContext.Provider value={{ user, loading, setUser, refreshUser }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // }

// // export function useAuth() {
// //   const context = useContext(AuthContext);
// //   if (context === undefined) {
// //     throw new Error('useAuth must be used within an AuthProvider');
// //   }
// //   return context;
// // }
