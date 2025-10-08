'use client';

import ContestDescription from '@/components/contests/ContestDescription';
import ContestHeader from '@/components/contests/ContestHeader';
import ScoreboardTable from '@/components/contests/Scoreboard';
import Forbidden from '@/components/global/Forbidden';
import Difficulty from '@/components/problems/Difficulty';
import { ContestInfos } from '@/models/Contest';
import api from '@/utils/ky';
import {
    Badge,
    Card,
    Container,
    Group,
    Space,
    Table,
    Text,
    Title,
    useMantineTheme,
    Tooltip,
    Paper,
    Loader,
    Center,
} from '@mantine/core';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { HTTPError } from 'ky';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaCaretLeft } from 'react-icons/fa6';

export default function OngoingContests() {
    const [contest, setContest] = useState<ContestInfos>();
    const searchParams = useSearchParams();
    const contestId = searchParams.get('id');
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [forbidden, setForbidden] = useState(true);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const theme = useMantineTheme();

    const fetchContest = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`contests/${contestId}/ongoing`);
            const data = await response.json<ContestInfos>();
            setContest(data);
            setForbidden(false);
        } catch (error: unknown) {
            if (error instanceof HTTPError && error.response.status === 403) {
                setForbidden(true);
            } else {
                console.log(error);
            }
        }
        setIsLoading(false);
    }, [contestId]);

    const handleProblemClick = useCallback(
        (id: number) => {
            if (!contest) return;
            router.push(`/contests/${contest.id}/submission/${id}`);
        },
        [contest, router],
    );

    useEffect(() => {
        fetchContest();
    }, [fetchContest]);


    // fetchContest every 30 seconds to update the contest info
    useEffect(() => {
        const interval = setInterval(() => {
            fetchContest();
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchContest]);

    useEffect(() => {
        if (!contest?.end_datetime) return;

        const updateCountdown = () => {
            const endTime = new Date(contest.end_datetime);
            if (isNaN(endTime.getTime())) return;

            const now = new Date().getTime();
            const difference = endTime.getTime() - now;

            if (difference <= 0) {
                setTimeLeft('Contest has ended');
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / (1000 * 60)) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            const timeString = `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`;
            setTimeLeft(timeString);
        };

        const timer = setInterval(updateCountdown, 1000);
        updateCountdown();

        return () => clearInterval(timer);
    }, [contest?.end_datetime]);

    const problemColumns = useMemo(
        () => [
            {
                header: 'Title',
                accessorKey: 'title',
                cell: (info: any) => (
                    <Text
                        c='blue'
                        onClick={() => handleProblemClick(info.row.original.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        {info.getValue()}
                    </Text>
                ),
            },
            {
                header: 'Points',
                accessorKey: 'points',
                cell: (info: any) => <Text>{info.getValue()}</Text>,
            },
            {
                header: 'Languages',
                accessorKey: 'languages',
                cell: (info: any) => {
                    const languages: string[] = info.getValue();
                    const displayed = languages.slice(0, 3);
                    const hidden = languages.slice(3);

                    return (
                        <Group gap='xs'>
                            {displayed.map((language, index) => (
                                <Badge key={index} color='blue' variant='light'>
                                    {language}
                                </Badge>
                            ))}
                            {hidden.length > 0 && (
                                <Tooltip
                                    label={hidden.join(', ')}
                                    withArrow
                                    multiline
                                >
                                    <Badge color='gray' variant='light'>
                                        +{hidden.length} more
                                    </Badge>
                                </Tooltip>
                            )}
                        </Group>
                    );
                },
            },
            {
                header: 'Difficulty',
                accessorKey: 'difficulty',
                cell: (info: any) => (
                    <Difficulty difficulty={info.getValue()} />
                ),
            },
        ],
        [handleProblemClick],
    );

    const problemTable = useReactTable({
        data: contest?.problems || [],
        columns: problemColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
    });

    if (isLoading) {
        return (
            <Container mt={'30%'}>
                <Center>
                    <Loader />
                </Center>
            </Container>
        );
    }

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
                <FaCaretLeft
                    color={
                        isHovered ? theme.colors[theme.primaryColor][6] : 'gray'
                    }
                />
                <Text size='md' c={isHovered ? theme.primaryColor : 'dimmed'}>
                    Back to contest
                </Text>
            </Group>
            <Space h='md' />
            <Paper radius='md' shadow='xs' p='xl' pt='xs' withBorder>
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
                    timeLeft={timeLeft}
                />
                <Space h='lg' />
                <ContestDescription description={contest?.description} />
            </Paper>

            <Space h='xl' />

            <Card withBorder shadow='sm' radius='md' p='md'>
                <Title order={4} mb='md'>
                    Problems
                </Title>
                <Table highlightOnHover>
                    <Table.Thead>
                        {problemTable.getHeaderGroups().map((headerGroup) => (
                            <Table.Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Table.Th
                                        key={header.id}
                                        onClick={header.column.getToggleSortingHandler()}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className='flex items-center'>
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                        </div>
                                    </Table.Th>
                                ))}
                            </Table.Tr>
                        ))}
                    </Table.Thead>
                    <Table.Tbody>
                        {problemTable.getRowModel().rows.map((row) => (
                            <Table.Tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <Table.Td key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </Table.Td>
                                ))}
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Card>

            <Space h='xl' />

            <Card withBorder shadow='sm' radius='md' p='md'>
                <Title order={4}>Leaderboard</Title>
                {contest && (
                    <ScoreboardTable
                        scoreboard={contest.scoreboard}
                        problems={contest.problems}
                        users={contest.users}
                    />
                )}
            </Card>
        </Container>
    );
}
