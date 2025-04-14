'use client';

import { usePathname } from 'next/navigation';
import React from 'react';
import AdminLayoutComponent from '../admin/AdminLayout';
import MainLayout from './MainLayout';
import SubmissionLayoutComponent from '../submission/SubmissionLayout';

export default function AppLayout({
    children,
    username,
    userPermissions,
}: Readonly<{
    children: React.ReactNode;
    username: string | null;
    userPermissions: number | null;
}>) {
    const pathname = usePathname();

    if (
        pathname.startsWith('/admin') &&
        username != null &&
        userPermissions != null
    ) {
        return (
            <AdminLayoutComponent
                username={username}
                userPermissions={userPermissions}
            >
                {children}
            </AdminLayoutComponent>
        );
    }

    if (
        pathname.includes('submission') &&
        username != null &&
        userPermissions != null
    ) {
        return (
            <SubmissionLayoutComponent
                username={username}
                userPermissions={userPermissions}
            >
                {children}
            </SubmissionLayoutComponent>
        );
    }

    return (
        <MainLayout username={username} userPermissions={userPermissions}>
            {children}
        </MainLayout>
    );
}
