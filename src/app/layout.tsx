import type { Metadata } from 'next';
import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/charts/styles.css';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import AppLayout from '@/components/navigation/AppLayout';
import { headers } from 'next/headers';

export const metadata: Metadata = {
    title: 'ByteBlitz',
    description: 'ByteBlitz by IEEE Student Branch of Brescia',
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headerList = await headers();
    const loggedUser = headerList.get('X-LOGGED-USER');
    const loggedUserPermissionsString = headerList.get('X-LOGGED-PERMISSIONS');
    const loggedUserPermissions =
        loggedUserPermissionsString == null
            ? null
            : Number(headerList.get('X-LOGGED-PERMISSIONS'));

    return (
        <html lang='en' suppressHydrationWarning>
            <body className={`vsc-initialized antialiased`}>
                <MantineProvider defaultColorScheme='auto'>
                    <Notifications />
                    <ModalsProvider>
                        <AppLayout
                            username={loggedUser}
                            userPermissions={loggedUserPermissions}
                        >
                            {children}
                        </AppLayout>
                    </ModalsProvider>
                </MantineProvider>
            </body>
        </html>
    );
}
