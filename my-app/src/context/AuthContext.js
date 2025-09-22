"use client";
import { useContext, useState, useEffect, createContext } from "react";
import { useRouter } from "next/navigation";
const AuthContext = createContext();

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Initial auth check
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if we have valid tokens by trying to refresh
                const response = await refreshToken();
                if (response.ok) {
                    // First, try to get user data from regular profile endpoint
                    let profileResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile`, {
                        credentials: 'include'
                    });

                    let profileData = null;
                    let userRole = null;

                    if (profileResponse.ok) {
                        profileData = await profileResponse.json();
                        userRole = profileData.role;
                    } else {
                        // If regular profile fails, try business profile
                        const businessProfileResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/business/profile`, {
                            credentials: 'include'
                        });
                        if (businessProfileResponse.ok) {
                            profileData = await businessProfileResponse.json();
                            userRole = 'business'; // Business profile doesn't return role, so we set it
                        }
                    }

                    if (profileData && userRole) {
                        // Extract user info from profile data
                        if (userRole === 'business') {
                            setUser({
                                email: profileData.companyEmail,
                                role: userRole,
                                id: profileData.bid,
                                companyName: profileData.companyName,
                                name: profileData.name
                            });
                        } else {
                            setUser({
                                email: profileData.email,
                                role: userRole,
                                id: profileData.id,
                                firstName: profileData.firstName,
                                lastName: profileData.lastName
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    // Handle token refresh
    useEffect(() => {
        let intervalId;

        if (user) {
            intervalId = setInterval(async () => {
                try {
                    const response = await refreshToken();
                    if (!response.ok) {
                        clearInterval(intervalId);
                        setUser(null);
                        router.replace('/');
                    }
                    // If refresh is successful, we don't need to update user state
                    // as the cookies are automatically updated by the server
                } catch (error) {
                    console.error('Token refresh failed:', error);
                    clearInterval(intervalId);
                    setUser(null);
                    router.replace('/');
                }
            }, 4 * 60 * 1000); // Refresh every 4 minutes (tokens expire in 5 minutes)
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [user, router]);

    const login = async(email, password) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
                credentials: 'include'
            });

            if (!response.ok) {
                return response;
            }

            const data = await response.json();
            // Set user state after successful login
            setUser({
                email: data.email,
                role: data.role,
                id: data.userId
            });

            return response;
        } catch(e) {
            return new Response(JSON.stringify({ error: 'Network error during login' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    const logout = async() => {
        try{
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (response.ok) {
                setUser(null);  // Clear user state
                router.replace('/');  // Redirect to login page
            }

            return response;
        } catch(e) {
            return new Response(JSON.stringify({ error: 'Network error during logout' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }   

    const register = async(email, password) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
            });

            if (!response.ok) {
                return response;
            }

            const data = await response.json();
            // Set user state after successful registration
            setUser({
                email: data.email,
                role: data.role,
                id: data.userId
            });

            return response;
        } catch(e) {
            return new Response(JSON.stringify({ error: 'Network error during registration' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    const refreshToken = async () => {
        try {
            // Try regular user refresh first
            let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: 'include'
            });

            // If regular refresh fails, try business refresh
            if (!response.ok) {
                response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/business/refresh`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include'
                });
            }

            // Treat 204 No Content as non-fatal (no refresh cookie yet)
            if (response.status === 204) {
                return new Response(null, { status: 204 });
            }

            if (!response.ok) {
                return new Response(JSON.stringify({ error: 'Token refresh failed' }), {
                    status: response.status,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            return response;
        } catch (error) {
            // Return a proper JSON response even for network errors
            return new Response(JSON.stringify({ error: 'Network error during refresh' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    };

    const loginBusiness = async(email, password) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/business/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
                credentials: 'include'
            });

            if (!response.ok) {
                return response;
            }

            const data = await response.json();
            // Set user state after successful business login
            setUser({
                email: data.email,
                role: data.role,
                id: data.bid
            });

            return response;
        } catch(e) {
            return new Response(JSON.stringify({ error: 'Network error during business login' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    };

    const registerBusiness = async (businessData) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/business/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: businessData.name,
                    email: businessData.email,
                    companyName: businessData.companyName,
                    companyEmail: businessData.companyEmail,
                    address: businessData.address,
                    city: businessData.city,
                    state: businessData.state,
                    country: businessData.country,
                    password: businessData.password
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Business registration failed');
            }

            return response;
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Network error during business registration' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    };

    const signInWithGoogle = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google-signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Google sign-in failed:', errorData);
                throw new Error(errorData.error || 'Failed to sign in with Google');
            }

            const data = await response.json();
            // Redirect to Google OAuth consent screen
            window.location.href = data.url;
        } catch (error) {
            console.error('Failed to initialize Google sign in:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, loginBusiness, registerBusiness, setUser, logout, signInWithGoogle }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}