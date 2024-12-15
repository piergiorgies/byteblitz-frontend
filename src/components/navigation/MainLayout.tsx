'use client';

import {
    AppShell,
    Burger,
    Button,
    Flex,
    Group,
    Text,
    Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React from 'react';
import HeaderUserButton from './HeaderUserButton';
import { useRouter } from 'next/navigation';

export default function MainLayout({
    children,
    username,
    userPermissions,
}: Readonly<{
    children: React.ReactNode;
    username: string | null;
    userPermissions: number | null;
}>) {
    const router = useRouter();
    const [opened, { toggle }] = useDisclosure();

    return (
        <>
            <AppShell header={{ height: 60 }} padding='md'>
                <AppShell.Header>
                    <Group h='100%' px='md'>
                        <Flex w={'100%'}>
                            <Burger
                                opened={opened}
                                onClick={toggle}
                                hiddenFrom='sm'
                                size='sm'
                            />
                            <Flex
                                justify='space-between'
                                align='center'
                                w={'100%'}
                            >
                                <Title
                                    c='dimmed'
                                    role='button'
                                    onClick={() => router.push('/')}
                                >
                                    ByteBlitz
                                </Title>
                                <HeaderUserButton
                                    username={username}
                                    userPermissions={userPermissions}
                                />
                            </Flex>
                        </Flex>
                    </Group>
                </AppShell.Header>
                <AppShell.Main className='bg-slate-100'>
                    {children}
                </AppShell.Main>
            </AppShell>
        </>
    );
}
