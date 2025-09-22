'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import './LogoutButton.css';

export default function LogoutButton({ className }) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/business/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Logout failed');
            }

            toast.success('Logged out successfully');
            
            // Redirect after a short delay to allow the toast to be seen
            setTimeout(() => {
                router.push('/Bauth');
            }, 1000);
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout. Please try again.');
        }
    };

    return (
        <button
            onClick={handleLogout}
            className={`logout-button ${className || ''}`}
        >
            Logout
        </button>
    );
} 