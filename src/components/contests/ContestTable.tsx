'use client';

import {
    Box,
    Button,
    Center,
    Divider,
    Flex,
    Pagination,
    Select,
    Skeleton,
    Space,
    Table,
    Text,
} from '@mantine/core';
import { Contest } from '@/models/Contest';
import api from '@/utils/ky';
import { headers } from 'next/headers';
import { use, useEffect, useMemo, useState } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
    FaPenToSquare,
    FaSort,
    FaSortDown,
    FaSortUp,
    FaTrash,
} from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

export default function ContestTable({ filter }: { filter: string }) {
    const [contests, setContests] = useState<Contest[]>([]);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<any>([]);
    const [areContestsLoading, setAreContestsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: pageSize,
    });
    const [rowCount, setRowCount] = useState(0);
    const router = useRouter();

    const getContests = async () => {
        try {
            const response = await api.get('contests', {
                searchParams: {
                    limit: pagination.pageSize,
                    offset: pagination.pageIndex * pagination.pageSize,
                    filter: filter,
                },
            });

            const contests = await response.json<{
                data: Contest[];
                count: number;
            }>();
            setContests(contests.data);
            setRowCount(contests.count);

            if (
                pagination.pageIndex * pagination.pageSize >= contests.count &&
                pagination.pageIndex !== 0
            ) {
                setPagination({
                    pageIndex: pagination.pageIndex - 1,
                    pageSize: pagination.pageSize,
                });
            }
        } catch (error) {
            console.log(error);
        }

        setAreContestsLoading(false);
    };

    const handleEditContest = async (contest: Contest) => {
        router.push(`/admin/contests/edit?id=${contest.id}`);
    };

    useEffect(() => {
        setAreContestsLoading(true);
        getContests();
    }, [pagination, filter]);

    useEffect(() => {
        table.setGlobalFilter(filter);
    }, [filter]);

    useEffect(() => {
        setPagination({ ...pagination, pageSize: pageSize });
    }, [pageSize]);


    const handleDeleteContest = async (contest: Contest) => {
        modals.openConfirmModal({
            title: 'Delete Contest',
            children: (
                <Text>
                    Are you sure you want to delete the contest{' '}
                    <Text span fw='bold'>
                        {contest.name}
                    </Text>
                    ?
                </Text>
            ),
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            confirmProps: { variant: 'sublte', color: 'red' },
            onConfirm: async () => {
                try {
                    await api.delete(`contests/${contest.id}`);
                    notifications.show({
                        title: 'Deleted',
                        message: 'Contest deleted successfully',
                        color: 'green',
                    });
                    await getContests();
                } catch (error) {
                    console.log(error);
                }
            }
        })
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: '#',
                cell: (info: any) => <Text>{info.getValue()}</Text>,
            },
            {
                accessorKey: 'name',
                header: 'Name',
                cell: (info: any) => <Text>{info.getValue()}</Text>,
            },
            {
                accessorKey: 'description',
                header: 'Description',
                cell: (info: any) => <Text>{info.getValue()}</Text>,
            },
            {
                accessorKey: 'start_datetime',
                header: 'Start Date',
                cell: (info: any) => {
                    const rawDate = info.getValue();
                    const formattedDate = rawDate
                        ? dayjs(rawDate).format('YYYY-MM-DD HH:mm:ss')
                        : 'N/A';
                    return <Text>{formattedDate}</Text>;
                },
            },
            {
                accessorKey: 'end_datetime',
                header: 'End Date',
                cell: (info: any) => {
                    const rawDate = info.getValue();
                    const formattedDate = rawDate
                        ? dayjs(rawDate).format('YYYY-MM-DD HH:mm:ss')
                        : 'N/A';
                    return <Text>{formattedDate}</Text>;
                },
            },
        ],
        [],
    );

    const table = useReactTable({
        data: contests,
        columns: columns,
        state: {
            sorting,
            pagination,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        rowCount,
    });

    return (
        <Box>
            <Table highlightOnHover>
                <Table.Thead>
                    {table.getHeaderGroups().map((headerGroup) => (
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
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </div>
                                </Table.Th>
                            ))}
                        </Table.Tr>
                    ))}
                </Table.Thead>

                <Table.Tbody hidden={areContestsLoading}>
                    {table.getRowModel().rows.map((row) => (
                        <Table.Tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <Table.Td key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                    )}
                                </Table.Td>
                            ))}
                            <Table.Td>
                                <Flex>
                                    <Button
                                        size='xs'
                                        variant='subtle'
                                        color='blue'
                                        onClick={() =>
                                            handleEditContest(row.original)
                                        }
                                    >
                                        <FaPenToSquare />
                                    </Button>
                                    <Button
                                        size='xs'
                                        variant='subtle'
                                        color='red'
                                        onClick={() => {
                                            handleDeleteContest(row.original);
                                        }}
                                    >
                                        <FaTrash />
                                    </Button>
                                </Flex>
                            </Table.Td>
                        </Table.Tr>
                    ))}

                    {table.getRowModel().rows.length === 0 ? (
                        <Table.Tr>
                            <Table.Td colSpan={columns.length + 1}>
                                <Center>
                                    <Text c='dimmed'>No contests found.</Text>
                                </Center>
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        <></>
                    )}
                </Table.Tbody>

                <Table.Tbody hidden={!areContestsLoading}>
                    {Array(3)
                        .fill(0)
                        .map((_, i) => (
                            <Table.Tr key={i}>
                                <Table.Td>
                                    <Skeleton width='70%'>
                                        <Space h='lg' />
                                    </Skeleton>
                                </Table.Td>
                                <Table.Td>
                                    <Skeleton width='70%'>
                                        <Space h='lg' />
                                    </Skeleton>
                                </Table.Td>
                                <Table.Td>
                                    <Skeleton width='70%'>
                                        <Space h='lg' />
                                    </Skeleton>
                                </Table.Td>
                                <Table.Td>
                                    <Skeleton width='70%'>
                                        <Space h='lg' />
                                    </Skeleton>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                </Table.Tbody>
            </Table>

            <Divider my='md' />

            <Flex justify='space-between'>
                <Select
                    data={[
                        { value: '5', label: '5' },
                        { value: '10', label: '10' },
                        { value: '15', label: '15' },
                    ]}
                    value={pageSize.toString()}
                    onChange={(value, _) =>
                        setPageSize(value == null ? 10 : parseInt(value))
                    }
                />

                <Pagination
                    value={pagination.pageIndex + 1}
                    total={table.getPageCount()}
                    onChange={(page) =>
                        setPagination((prev) => ({
                            ...prev,
                            pageIndex: page - 1,
                        }))
                    }
                />
            </Flex>
        </Box>
    );
}
