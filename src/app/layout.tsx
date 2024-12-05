import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';

export const metadata: Metadata = {
    title: 'ByteBlitz',
    description: 'ByteBlitz by IEEE Student Branch of Brescia',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body className={`vsc-initialized antialiased`}>
                <MantineProvider>
                    <Notifications/>
                    <ModalsProvider>
                        {children}
                    </ModalsProvider>
                </MantineProvider>
            </body>
        </html>
    );
}
