'use client';

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
} from '@mantine/core';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
    FaCaretLeft,
    FaInfo,
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

    const contestStart = new Date(contest?.start_datetime || '');
    const notificationTitle =
        'Contest start at ' + contestStart.toLocaleString();

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

            <Flex align='end'>
                <Title mt={8} order={1}>
                    {contest?.name}
                </Title>
                <Badge size='lg' m='sm' p='xs' color='gray'>
                    {notificationTitle}
                </Badge>
                {/* <Text p='xs' c='dimmed'>{notificationTitle}</Text> */}
            </Flex>
            <Space h='xl' />

            <Blockquote my={4} color='gray' icon={<FaInfo />} iconSize={30}>
                {contest?.description}
            </Blockquote>

            <Space h='xl' />

            <Grid gutter={{ base: 5, xs: 'md', md: 'xl', xl: 50 }}>
                <Grid.Col span={6}>
                    <Title order={4}>Problems</Title>
                    <Table highlightOnHover>
                        <Table.Thead>
                            {problemTable
                                .getHeaderGroups()
                                .map((headerGroup) => (
                                    <Table.Tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <Table.Th
                                                key={header.id}
                                                onClick={header.column.getToggleSortingHandler()}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className='flex items-center'>
                                                    {!header.column.getIsSorted() ? (
                                                        <span className='me-1 text-slate-400'>
                                                            <FaSort />
                                                        </span>
                                                    ) : header.column.getIsSorted() ===
                                                      'desc' ? (
                                                        <span className='me-1 text-slate-400'>
                                                            <FaSortDown />
                                                        </span>
                                                    ) : (
                                                        <span className='me-1 text-slate-400'>
                                                            <FaSortUp />
                                                        </span>
                                                    )}
                                                    {flexRender(
                                                        header.column.columnDef
                                                            .header,
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
                </Grid.Col>
                <Grid.Col span={6}>
                    <Title order={4}>Leaderboard</Title>
                    <Text size='md'>
                        Contest leaderboard will be available here
                    </Text>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
