import AutoBreadcrumbs from '@/components/navigation/AutoBreadcrumbs';
import { Box, Space } from '@mantine/core';
import React from 'react';

export default async function AdminLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <Box p='md'>
            <AutoBreadcrumbs />
            <Space h='sm' />
            {children}
        </Box>
    );
}
