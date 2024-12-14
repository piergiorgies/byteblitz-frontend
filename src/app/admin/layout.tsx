import AdminLayoutComponent from '@/components/admin/AdminLayout';
import AutoBreadcrumbs from '@/components/admin/AutoBreadcrumbs';
import { Box, Space } from '@mantine/core';
import { headers } from 'next/headers';
import React from 'react';

export default async function AdminLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const headerList = await headers();
    const loggedUser = headerList.get('X-LOGGED-USER') ?? 'User';
    const loggedUserPermissions = Number(
        headerList.get('X-LOGGED-PERMISSIONS'),
    );

    return (
        <AdminLayoutComponent
            username={loggedUser}
            userPermissions={loggedUserPermissions}
        >
            <Box bg='white' p='md'>
                <AutoBreadcrumbs />
                <Space h='sm' />
                {children}
            </Box>
        </AdminLayoutComponent>
    );
}
