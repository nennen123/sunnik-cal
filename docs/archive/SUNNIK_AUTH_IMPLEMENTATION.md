# SUNNIK CALCULATOR - AUTHENTICATION IMPLEMENTATION

## Overview
- **Auth Provider:** Supabase Auth
- **Login Method:** Email + Password
- **Users:** Nelson, Ryan, Aiwee (3 accounts)
- **Unauthorized:** Redirect to sunnik.net
- **Future Domain:** calc.sunnik.net

---

## PHASE 1: SUPABASE SETUP (In Browser)

### Step 1.1: Enable Email Auth in Supabase

1. Go to: https://supabase.com/dashboard
2. Select your Sunnik project
3. Go to **Authentication** â†’ **Providers**
4. Ensure **Email** is enabled (should be by default)
5. Go to **Authentication** â†’ **Settings**
6. Under "Email Auth", you can disable "Confirm email" for now (simpler for internal use)

### Step 1.2: Create User Accounts

1. Go to **Authentication** â†’ **Users**
2. Click **Add User** â†’ **Create New User**
3. Create 3 users:

| Email | Password | Note |
|-------|----------|------|
| nelson@sunnik.net | (set secure password) | Admin |
| ryan@sunnik.net | (set secure password) | User |
| aiwee@sunnik.net | (set secure password) | User |

*(Use actual email addresses so they can reset passwords if needed)*

---

## PHASE 2: CODE IMPLEMENTATION

### Step 2.1: Create Auth Context

**File: `app/context/AuthContext.js`** (NEW FILE)

```javascript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Redirect to sunnik.net after logout
    window.location.href = 'https://www.sunnik.net';
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

### Step 2.2: Create Login Page

**File: `app/login/page.js`** (NEW FILE)

```javascript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/calculator');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">SUNNIK</h1>
          <p className="text-gray-500 text-sm">Tank Calculator</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@sunnik.net"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a
            href="https://www.sunnik.net"
            className="text-sm text-gray-500 hover:text-blue-600"
          >
            â† Back to sunnik.net
          </a>
        </div>
      </div>
    </div>
  );
}
```

---

### Step 2.3: Create Protected Route Component

**File: `app/components/ProtectedRoute.js`** (NEW FILE)

```javascript
'use client';

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect unauthorized users to sunnik.net
      window.location.href = 'https://www.sunnik.net';
    }
  }, [user, loading]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user, show nothing (will redirect)
  if (!user) {
    return null;
  }

  // User is authenticated, show content
  return children;
}
```

---

### Step 2.4: Update Root Layout

**File: `app/layout.js`** (MODIFY)

Add AuthProvider wrapper:

```javascript
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Sunnik Tank Calculator',
  description: 'Professional tank quotation system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

### Step 2.5: Protect Calculator Page

**File: `app/calculator/page.js`** (MODIFY)

Wrap existing content with ProtectedRoute:

```javascript
'use client';

import ProtectedRoute from '../components/ProtectedRoute';
// ... other existing imports

export default function CalculatorPage() {
  // ... existing state and logic

  return (
    <ProtectedRoute>
      {/* Your existing calculator JSX goes here */}
      <div className="...">
        {/* ... all existing content ... */}
      </div>
    </ProtectedRoute>
  );
}
```

---

### Step 2.6: Add Logout Button to Calculator

Add this somewhere in your calculator header/nav:

```javascript
import { useAuth } from '../context/AuthContext';

// Inside your component:
const { user, signOut } = useAuth();

// In your JSX (e.g., top right corner):
<div className="flex items-center gap-4">
  <span className="text-sm text-gray-600">{user?.email}</span>
  <button
    onClick={signOut}
    className="text-sm text-red-600 hover:text-red-800"
  >
    Logout
  </button>
</div>
```

---

### Step 2.7: Update Root Page (Optional)

**File: `app/page.js`** (MODIFY)

Redirect root to login or calculator:

```javascript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/calculator');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

---

## PHASE 3: TESTING

### Test Checklist

| Test | Expected Result |
|------|-----------------|
| Visit `/calculator` without login | Redirect to sunnik.net |
| Visit `/login` | Show login form |
| Login with wrong password | Show error message |
| Login with correct credentials | Redirect to calculator |
| Click Logout | Redirect to sunnik.net |
| Refresh page while logged in | Stay on calculator |

---

## PHASE 4: CUSTOM DOMAIN (After Auth Works)

### Step 4.1: In Vercel

1. Go to your project in Vercel
2. Settings â†’ Domains
3. Add `calc.sunnik.net`
4. Vercel will show DNS records to add

### Step 4.2: In Your DNS Provider

Add CNAME record:
- **Name:** calc
- **Value:** cname.vercel-dns.com
- **TTL:** Auto or 3600

### Step 4.3: Wait for DNS Propagation

- Usually 5-30 minutes
- Can take up to 48 hours

---

## CLAUDE CODE PROMPT

Copy this to Cursor to implement all files:

```
Please implement Supabase authentication for the Sunnik Calculator:

1. Create app/context/AuthContext.js with:
   - AuthProvider component
   - useAuth hook
   - signIn function (email + password)
   - signOut function (redirects to sunnik.net)
   - User state management

2. Create app/login/page.js with:
   - Login form (email + password)
   - Error handling
   - Redirect to /calculator on success
   - Link back to sunnik.net

3. Create app/components/ProtectedRoute.js with:
   - Check if user is authenticated
   - Show loading spinner while checking
   - Redirect to sunnik.net if not authenticated

4. Modify app/layout.js to wrap children with AuthProvider

5. Modify app/calculator/page.js to wrap content with ProtectedRoute

6. Modify app/page.js to redirect:
   - If logged in â†’ /calculator
   - If not logged in â†’ /login

7. Add logout button to calculator page header showing user email

Use the existing supabase client from app/lib/supabase.js

Show me all files before creating them.
```

---

## ROLLBACK

If auth doesn't work, you can:
1. Remove AuthProvider from layout.js
2. Remove ProtectedRoute from calculator/page.js
3. Delete new files (AuthContext.js, login/page.js, ProtectedRoute.js)

---

## FILE CHECKLIST

| File | Action | Status |
|------|--------|--------|
| `app/context/AuthContext.js` | CREATE | â¬œ |
| `app/login/page.js` | CREATE | â¬œ |
| `app/components/ProtectedRoute.js` | CREATE | â¬œ |
| `app/layout.js` | MODIFY | â¬œ |
| `app/calculator/page.js` | MODIFY | â¬œ |
| `app/page.js` | MODIFY | â¬œ |

---

*Authentication Implementation Guide - January 11, 2026*
*Version: 1.0*
