'use client';

import { AppShell, Burger, Button, Group, NavLink, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React from 'react';

export default function AdminLayoutComponent({
    children,
    username,
    userPermissions,
}: Readonly<{ children: React.ReactNode, username: string, userPermissions: number }>) {
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
                        <div className='flex w-full'>
                            <Burger
                                opened={opened}
                                onClick={toggle}
                                hiddenFrom='sm'
                                size='sm'
                            />
                            <div className='flex w-full items-center justify-between'>
                                <Text c='dimmed'>ByteBlitz</Text>
                                <Button
                                // onClick={handleLogout}
                                >
                                    {username}
                                </Button>
                            </div>
                        </div>
                    </Group>
                </AppShell.Header>
                <AppShell.Navbar p='xs'></AppShell.Navbar>
                <AppShell.Main className='bg-slate-100'>
                    {children}
                </AppShell.Main>
            </AppShell>
        </>
    );
}