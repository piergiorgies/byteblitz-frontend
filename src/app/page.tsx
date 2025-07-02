'use client';

import { Statistics } from '@/models/General';
import api from '@/utils/ky';
import {
    Button,
    Center,
    Container,
    Space,
    Stack,
    Text,
    Title,
    Card,
    SimpleGrid,
    Group,
    Divider,
    ThemeIcon,
    useMantineTheme,
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaCode, FaTrophy, FaUser } from 'react-icons/fa6';

export default function Home() {
    const router = useRouter();
    const [statistics, setStatistics] = useState<Statistics>();
    const getStatistics = async () => {
        try {
            console.log('Fetching statistics...');
            const response = await api.get('dashboard/stats');
            const data = await response.json<Statistics>();
            setStatistics(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getStatistics();
    }, []);

    return (
        <Container fluid>
            <div className='min-h-screen py-16'>
                <Center>
                    <Stack gap='lg' align='center' className='text-center'>
                        <Title order={1} size='3rem'>
                            Welcome to ByteBlitz
                        </Title>
                        <Text size='xl' c='dimmed'>
                            A platform for coding competitions.
                        </Text>
                        <Group mt='md'>
                            <Button
                                size='md'
                                variant='outline'
                                onClick={() => router.push('/problems')}
                            >
                                Try a Problem
                            </Button>
                            <Button
                                size='md'
                                variant='filled'
                                onClick={() => router.push('/contests')}
                            >
                                Join a Contest
                            </Button>
                        </Group>
                    </Stack>
                </Center>

                <Space h='xl' />

                <Center>
                    <SimpleGrid
                        cols={{ base: 1, sm: 3 }}
                        spacing='xl'
                        px='xl'
                        w='100%'
                        maw={900}
                    >
                        <StatCard
                            icon={<FaCode size={24} />}
                            data={statistics?.problems.toString() || '0'}
                            subtitle='Public Problems'
                        />
                        <StatCard
                            icon={<FaTrophy size={24} />}
                            data={statistics?.contests.toString() || '0'}
                            subtitle='Contests Hosted'
                        />
                        <StatCard
                            icon={<FaUser size={24} />}
                            data={statistics?.users.toString() || '0'}
                            subtitle='Users Registered'
                        />
                    </SimpleGrid>
                </Center>
            </div>
        </Container>
    );
}

function StatCard({
    icon,
    data,
    subtitle,
}: {
    icon: React.ReactNode;
    data: string;
    subtitle: string;
}) {
    const theme = useMantineTheme();

    return (
        <Card
            shadow='sm'
            padding='xl'
            radius='md'
            withBorder
            style={{ backgroundColor: theme.white }}
        >
            <Group justify='space-between'>
                <ThemeIcon
                    variant='light'
                    size='lg'
                    radius='xl'
                    color='primary'
                >
                    {icon}
                </ThemeIcon>
            </Group>
            <Divider my='sm' />
            <Title order={3}>{data}</Title>
            <Text c='dimmed' size='sm'>
                {subtitle}
            </Text>
        </Card>
    );
}
