'use client';

import ContestHeader from '@/components/contests/ContestHeader';
import Forbidden from '@/components/global/Forbidden';
import { Contest, ContestProblem, ContestInfo } from '@/models/Contest';
import api from '@/utils/ky';
import {
    Container,
    Center,
    Flex,
    Group,
    Text,
    Title,
    Notification,
    useMantineTheme,
    Space,
    Table,
    Badge,
    Grid,
    Blockquote,
    Card,
    Paper,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { HTTPError } from 'ky';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
    FaCaretLeft,
    FaInfo,
    FaRegClock,
    FaSort,
    FaSortDown,
    FaSortUp,
} from 'react-icons/fa6';

export default function ViewContestPage() {
    const [contest, setContest] = useState<ContestInfo>();
    const searchParams = useSearchParams();
    const contestId = searchParams.get('id');
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);

    const [forbidden, setForbidden] = useState(true);

    const theme = useMantineTheme();

    const fetchContest = async () => {
        try {
            const response = await api.get(`contests/${contestId}/upcoming`);
            const data = await response.json<ContestInfo>();
            setContest(data);
            setForbidden(false);
        } catch (error) {
            console.error('Error fetching contest:', error);
        }

        console.log(contest);
    };

    useEffect(() => {
        fetchContest();
    }, [contestId]);

    const problemColumns = useMemo(
        () => [
            {
                header: 'Title',
                accessorKey: 'title',
                cell: (info: any) => <Text>{info.getValue()}</Text>,
            },
            {
                header: 'Points',
                accessorKey: 'points',
                cell: (info: any) => <Text>{info.getValue()}</Text>,
            },
            {
                header: 'Languages',
                accessorKey: 'languages',
                cell: (info: any) => (
                    <Group gap='xs'>
                        {info
                            .getValue()
                            .map((language: string, index: number) => (
                                <Badge key={index} color='blue' variant='light'>
                                    {language}
                                </Badge>
                            ))}
                    </Group>
                ),
            },
        ],
        [],
    );

    const handleUserRegistration = async () => {
        try {
            const response = await api.post(`contests/${contestId}/register`);
            const data: any = await response.json();

            notifications.show({
                title: 'Success',
                message: data.message,
                color: 'green',
            });
        } catch (error) {
            if (error instanceof HTTPError) {
                const errorData = await error.response.json();
                const errorMessage =
                    errorData.message || 'Failed to register for contest';
                notifications.show({
                    title: 'Error',
                    message: errorMessage,
                    color: 'red',
                });
            }
        }
    };

    return forbidden ? (
        <Forbidden />
    ) : (
        <Container size='lg' py='xl'>
            <Group
                gap='xs'
                onClick={() => router.back()}
                style={{ cursor: 'pointer' }}
                onMouseOver={() => setIsHovered(true)}
                onMouseOut={() => setIsHovered(false)}
            >
                <FaCaretLeft color={isHovered ? theme.colors[theme.primaryColor][6] : 'gray'} />
                <Text size='md' c={isHovered ? theme.primaryColor : 'dimmed'}>
                    Back to contest
                </Text>
            </Group>
            <Space h='md' />
            <Paper radius="md" shadow="xs" p="xl" pt="xs" withBorder>
                <ContestHeader
                    title={contest?.name || 'Contest'}
                    startDatetime={
                        contest?.start_datetime
                            ? new Date(contest.start_datetime).toISOString()
                            : undefined
                    }
                    endDatetime={
                        contest?.end_datetime
                            ? new Date(contest.end_datetime).toISOString()
                            : undefined
                    }
                />
                <Space h="lg" />
                <Paper
                    withBorder
                    radius="md"
                    p="md"
                    shadow="xs"
                    style={{ backgroundColor: theme.colors.gray[0] }}
                >
                    <Group align="center" mb="sm">
                        <Flex align="center" gap="xs" mb="sm">
                            <FaInfo size={16} style={{ color: theme.colors.blue[6], marginTop: 2 }} />
                            <Text fw={600} size="md" c="blue.8">
                                Contest Description
                            </Text>
                        </Flex>
                    </Group>
                    <Text size="sm" c="gray.8">
                        {contest?.description || 'No description provided for this contest.'}
                    </Text>
                </Paper>
            </Paper>

            <Space h='xl' />

            <Card withBorder shadow='sm' radius='md' p='md'>
                <Title order={4}>Leaderboard</Title>
                <Text c='dimmed'>Coming soon...</Text>
            </Card>
        </Container>
    );
}
