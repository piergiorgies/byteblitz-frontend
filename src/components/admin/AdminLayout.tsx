'use client';

import { AppShell, Burger, Flex, Group, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React from 'react';
import AdminNavbar from './AdminNavbar';
import HeaderUserButton from '../navigation/HeaderUserButton';
import { useRouter } from 'next/navigation';

export default function AdminLayoutComponent({
    children,
    username,
    userPermissions,
}: Readonly<{
    children: React.ReactNode;
    username: string;
    userPermissions: number;
}>) {
    const router = useRouter();
    const [opened, { toggle }] = useDisclosure();

    return (
        <>
            <AppShell
                header={{ height: 60 }}
                navbar={{
                    width: 300,
                    breakpoint: 'sm',
                    collapsed: { mobile: !opened },
                }}
                padding='md'
            >
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
                <AppShell.Navbar p='xs'>
                    <AdminNavbar userPermissions={userPermissions} />
                </AppShell.Navbar>
                <AppShell.Main 
                // className='bg-slate-100'
                >
                    {children}
                </AppShell.Main>
            </AppShell>
        </>
    );
}
