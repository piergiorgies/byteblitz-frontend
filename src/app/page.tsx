'use client';
import { use, useEffect, useState } from 'react';
import { AppShell, Burger, Card, Center, Grid, Loader, rem, SimpleGrid, Skeleton, Space } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Navbar from '../components/home/Navbar';
import Link from 'next/link';
import api from '../utils/ky';

export default function Home() {
    const [opened, { toggle }] = useDisclosure();
    const [contests, setConstests] = useState([]);

    const maxProblems = 6;
    const offset = 0;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await api.get('contests/', {
                    searchParams: {
                        limit: maxProblems,
                        offset: offset,
                    }
                });
                response.json().then((data: any) => {
                    console.log(data.data);
                    setConstests(data.data);
                    setLoading(false);
                });
            }
            catch (error) {
                console.error(error);
            }
        };

        fetchContests();
    }, []);


    return (
        <AppShell
            header={{ height: 60 }}
        // padding="md"
        >
            <AppShell.Header>
                <Burger
                    opened={opened}
                    onClick={toggle}
                    hiddenFrom="sm"
                    size="sm"
                />
                <Navbar />
            </AppShell.Header>
            <AppShell.Main>
                <Center className='bg-gray-100'>
                    <div className='hero min-h-screen bg-base-200 my-6'>

                        <Space h={50} />
                        <Center>
                            <div className='hero-content text-center'>
                                <div className='max-w-lg'>
                                    <h1 className='text-5xl font-bold'>Welcome to ByteBlitz!</h1>
                                    <h4 className='text-2xl my-4'>A platform for coding competitions.</h4>
                                </div>
                            </div>
                        </Center>
                        <Space h={50} />
                        <SimpleGrid cols={3}>
                            {contests.map((contest: any) => (
                                <Card
                                    key={contest.id}
                                    shadow="sm"
                                    padding="lg"
                                    radius="md"
                                    withBorder
                                >
                                    <div>
                                        <h2 className='text-lg font-bold'>{contest.name}</h2>
                                        <p>{contest.description}</p>
                                    </div>
                                </Card>
                            ))}
                        </SimpleGrid>
                    </div>
                </Center>

            </AppShell.Main>
        </AppShell >
    );
}