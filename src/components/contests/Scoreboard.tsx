'use client';

import {
    Box,
    Table,
    Text,
    Skeleton,
    Center,
    ScrollArea,
    Paper,
    Title,
    Tooltip,
    Group,
    Badge,
    Flex,
} from '@mantine/core';
import { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from '@tanstack/react-table';
import { Scoreboard, UserScore } from '@/models/Scoreboard';
import { ContestProblem, ContestUser } from '@/models/Contest';

export default function ScoreboardTable({
    scoreboard,
    problems,
    users
}: {
    scoreboard: Scoreboard,
    problems: ContestProblem[],
    users: ContestUser[]
}) {
    const problemIds = useMemo(() => {
        const problemSet = new Set<number>();
        scoreboard.rankings.forEach((user) =>
            Object.keys(user.problems).forEach((pid) => problemSet.add(Number(pid))),
        );
        return Array.from(problemSet).sort((a, b) => a - b);
    }, [scoreboard]);

    const problemMap = useMemo(() => {
        const map = new Map<number, ContestProblem>();
        problems.forEach((problem) => {
            map.set(problem.id, problem);
        });
        return map;
    }, [problems]);

    const getColor = (percent: number) => {
        if (percent >= 0.9) return '#51cf66'; // green
        if (percent >= 0.5) return '#fcc419'; // yellow
        return '#f03e3e'; // red
    };

    const columns = useMemo<ColumnDef<UserScore>[]>(
        () => [
            {
                accessorKey: 'user_id',
                header: 'Username',
                cell: (info) => {
                    const userId = info.getValue<number>();
                    const user = users.find((user) => user.id === userId);
                    return (
                        <Text>
                            {user ? user.username : <Skeleton width={100} />}
                        </Text>
                    );
                },
            },
            ...problemIds.map((problemId) => {
                return {
                    accessorKey: `problems.${problemId}`,
                    header: () => {
                        const problem = problemMap.get(problemId);
                        const title = problem?.title || `Problem ${problemId}`;
                        const points = problem?.points ?? 0;

                        return (
                            <Tooltip label={title} withArrow withinPortal>
                                <Flex align="center" justify="space-between" w="100%" gap="xs">
                                    <Text truncate>{title}</Text>
                                    <Badge variant="light" color="gray" size="sm">
                                        {points}
                                    </Badge>
                                </Flex>
                            </Tooltip>
                        );
                    },
                    cell: (info: any) => {
                        const score = info.getValue() !== undefined ? (info.getValue() as number) : 0;
                        const maxPoints = problemMap.get(problemId)?.points ?? 0;
                        const percent = maxPoints === 0 ? 0 : Math.min(1, score / maxPoints);

                        const gradient = `linear-gradient(90deg, ${getColor(percent)} ${percent * 100}%, #e9ecef ${percent * 100}%)`;

                        return (
                            <Text
                                px={8}
                                py={4}
                                style={{
                                    background: gradient,
                                    textAlign: 'center',
                                    borderRadius: 4,
                                }}
                            >
                                {score}
                            </Text>
                        );
                    },
                };
            }),
            {
                accessorKey: 'total_score',
                header: 'Total Score',
                cell: (info) => <Text fw="bold" style={{ textAlign: 'center' }}>{info.getValue<number>()}</Text>,
            },
        ],
        [problemIds, users, problemMap]
    );

    const table = useReactTable({
        data: scoreboard.rankings,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Box>
            <ScrollArea pt={10}>
                <Table withColumnBorders>
                    <Table.Thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Table.Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <Table.Th key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </Table.Th>
                                ))}
                            </Table.Tr>
                        ))}
                    </Table.Thead>
                    <Table.Tbody>
                        {table.getRowModel().rows.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={columns.length}>
                                    <Center>
                                        <Text c="dimmed">No data available.</Text>
                                    </Center>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <Table.Tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <Table.Td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </Table.Td>
                                    ))}
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>
            </ScrollArea>
        </Box>
    );
}