'use client';

import ContestHeader from '@/components/contests/ContestHeader';
import Forbidden from '@/components/global/Forbidden';
import { ContestInfo } from '@/models/Contest';
import api from '@/utils/ky';
import { Anchor, Badge, Blockquote, Container, Flex, Grid, Group, Notification, Space, Table, Text, Title, useMantineTheme } from '@mantine/core';
import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import { HTTPError } from 'ky';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FaCaretLeft, FaInfo, FaSort, FaSortDown, FaSortUp } from 'react-icons/fa6';

export default function OngoingContests() {
    const [contest, setContest] = useState<ContestInfo>();
    const searchParams = useSearchParams();
    const contestId = searchParams.get('id');
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);

    const [forbidden, setForbidden] = useState(true);

    const [timeLeft, setTimeLeft] = useState<string>("");

    const theme = useMantineTheme();

    const fetchContest = async () => {
        try {
            const response = await api.get(`contests/${contestId}/ongoing`);
            const data = await response.json<ContestInfo>();
            setContest(data);
            setForbidden(false);
        } catch (error: unknown) {
            if (error instanceof HTTPError && error.response.status === 403) {
                setForbidden(true);
            } else {
                console.log('Error fetching contest:', error);
            }
        }
    };

    const handleProblemClick = (id: number) => {
        router.push(`/submission/${id}`);
    };

    useEffect(() => {
        fetchContest();
    }, [contestId]);

    useEffect(() => {
        if (!contest?.end_datetime) return;

        const updateCountdown = () => {
            const endTime = new Date(contest.end_datetime);
            if (isNaN(endTime.getTime())) return;  // Check if the date is valid

            const now = new Date().getTime();
            const difference = endTime.getTime() - now;

            if (difference <= 0) {
                setTimeLeft("Contest has ended");
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
                cell: (info: any) =>
                    <Text
                        c='blue'
                        onClick={() => handleProblemClick(info.row.original.id)}
                        style={{ cursor: 'pointer' }}>{info.getValue()}
                    </Text>,
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

    const problemTable = useReactTable({
        data: contest?.problems || [],
        columns: problemColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
    });

    return forbidden ? (
        <Forbidden />
    ) : (
        <Container size="lg">
            <Flex justify="left">
                <Group
                    gap="xs"
                    onClick={() => router.back()}
                    style={{
                        cursor: "pointer",
                        transition: "color 0.2s ease-in-out",
                    }}
                    onMouseOver={() => setIsHovered(true)}
                    onMouseOut={() => setIsHovered(false)}
                >
                    <FaCaretLeft
                        color={
                            isHovered
                                ? theme.colors[theme.primaryColor][6]
                                : "gray"
                        }
                    />
                    <Text size="md" c={isHovered ? theme.primaryColor : "dimmed"}>
                        Back to contest
                    </Text>
                </Group>
            </Flex>

            <ContestHeader
                title={contest?.name || 'Contest'}
                startDatetime={contest?.start_datetime ? new Date(contest.start_datetime).toISOString() : undefined}
                endDatetime={contest?.end_datetime ? new Date(contest.end_datetime).toISOString() : undefined}
            />

            {/* Notification for time left */}
            <Space h="md" />
            <Notification closeButtonProps={{ 'hidden': 'true' }} title='Contest ends in:' color='green'>
                <Text size="xl">
                    {timeLeft}
                </Text>
            </Notification>

            <Space h="xl" />
            <Blockquote my={4} color='gray' icon={<FaInfo />} iconSize={30}>
                {contest?.description}
            </Blockquote>

            <Space h="xl" />

            <Grid gutter={{ base: 5, xs: "md", md: "xl", xl: 50 }}>
                <Grid.Col span={6}>
                    <Title order={4}>Problems</Title>
                    <Table highlightOnHover>
                        <Table.Thead>
                            {problemTable.getHeaderGroups().map((headerGroup) => (
                                <Table.Tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <Table.Th
                                            key={header.id}
                                            onClick={header.column.getToggleSortingHandler()}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <div className="flex items-center">
                                                {!header.column.getIsSorted() ? (
                                                    <span className="me-1 text-slate-400">
                                                        <FaSort />
                                                    </span>
                                                ) : header.column.getIsSorted() === "desc" ? (
                                                    <span className="me-1 text-slate-400">
                                                        <FaSortDown />
                                                    </span>
                                                ) : (
                                                    <span className="me-1 text-slate-400">
                                                        <FaSortUp />
                                                    </span>
                                                )}
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
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
                                                cell.getContext()
                                            )}
                                        </Table.Td>
                                    ))}
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Title order={4}>Leaderboard</Title>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
