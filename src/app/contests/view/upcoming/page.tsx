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
        }
        catch (error) {
            if (error instanceof HTTPError) {
                const errorData = await error.response.json();
                const errorMessage = errorData.message || 'Failed to register for contest';
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
        <Container size='lg'>
            <Flex justify='left'>
                <Group
                    gap='xs'
                    onClick={() => router.back()}
                    style={{
                        cursor: 'pointer',
                        transition: 'color 0.2s ease-in-out',
                    }}
                    onMouseOver={() => setIsHovered(true)}
                    onMouseOut={() => setIsHovered(false)}
                >
                    <FaCaretLeft
                        color={
                            isHovered
                                ? theme.colors[theme.primaryColor][6]
                                : 'gray'
                        }
                    />
                    <Text
                        size='md'
                        c={isHovered ? theme.primaryColor : 'dimmed'}
                    >
                        Back to contest
                    </Text>
                </Group>
            </Flex>

            <ContestHeader
                title={contest?.name || ''}
                startDatetime={contest?.start_datetime ? new Date(contest?.start_datetime).toISOString() : undefined}
                endDatetime={contest?.end_datetime ? new Date(contest?.end_datetime).toISOString() : undefined}
                isRegistratioOpen={contest?.is_registration_open || false}
                handleUserRegistration={handleUserRegistration}
            />

            <Space h='xl' />


            <Blockquote my={4} color='gray' icon={<FaInfo />} iconSize={30}>
                {contest?.description}
            </Blockquote>

            <Space h='xl' />

            <Grid gutter={{ base: 5, xs: 'md', md: 'xl', xl: 50 }}>
                <Grid.Col span={6}>
                    <Title order={4}>Problems</Title>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Title order={4}>Leaderboard</Title>
                    <Text size='md'>
                        Contest leaderboard will be available here
                    </Text>
                </Grid.Col >
            </Grid >
        </Container >
    );
}
