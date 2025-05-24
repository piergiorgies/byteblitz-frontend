'use client';

import {
    AppShell,
    Burger,
    Flex,
    Group,
    Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import HeaderUserButton from './HeaderUserButton';
import { useRouter } from 'next/navigation';
import ColorSchemeChanger from '../global/ColorSchemeChanger';


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
                                    pt={5}
                                    role='button'
                                    onClick={() => router.push('/')}
                                >
                                    ByteBlitz
                                </Title>

                                <Group>
                                    <ColorSchemeChanger />
                                    <HeaderUserButton
                                        username={username}
                                        userPermissions={userPermissions}
                                    />
                                </Group>
                            </Flex>
                        </Flex>
                    </Group>
                </AppShell.Header>

                <AppShell.Main
                    style={{
                        paddingLeft: 0,
                        paddingRight: 0,
                        paddingBottom: 0,
                        paddingTop: '60px',
                    }}
                >
                    {children}
                </AppShell.Main>
            </AppShell>
        </>
    );
}
