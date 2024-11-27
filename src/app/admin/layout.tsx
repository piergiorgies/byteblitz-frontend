'use client';

import { AppShell, Burger, Button, Group, NavLink, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/router";
import React from "react";

export default function AdminLayout({ children }: Readonly<{children: React.ReactNode}>) {
    // const router = useRouter();
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
                                <Text c='dimmed'>
                                    ByteBlitz
                                </Text>
                                <Button
                                    size='xs'
                                    radius='xs'
                                    color='black'
                                    // onClick={handleLogout}
                                >
                                    Logout
                                </Button>
                            </div>
                        </div>
                    </Group>
                </AppShell.Header>
                <AppShell.Navbar p='xs'>
                    
                </AppShell.Navbar>
                <AppShell.Main className='bg-slate-100'>
                    {children}
                </AppShell.Main>
            </AppShell>
        </>
    );
}