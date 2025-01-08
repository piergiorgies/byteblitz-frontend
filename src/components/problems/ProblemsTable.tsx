'use client';

import { Problem } from '@/models/Problem';
import { useEffect, useMemo, useState } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import api from '@/utils/ky';
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
import {
    FaCheck,
    FaPenToSquare,
    FaSort,
    FaSortDown,
    FaSortUp,
    FaTrash,
    FaX,
} from 'react-icons/fa6';

import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';

export default function ProblemsTable({ filter }: { filter: string }) {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<any>([]);
    const [areProblemsLoading, setAreProblemsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: pageSize,
    });
    const [rowCount, setRowCount] = useState(0);

    const getProblems = async () => {
        try {
            const response = await api.get('problems', {
                searchParams: {
                    limit: pagination.pageSize,
                    offset: pagination.pageIndex * pagination.pageSize,
                    search: filter,
                },
            });

            const problems = await response.json<{
                data: Problem[];
                count: number;
            }>();
            setProblems(problems.data);
            setRowCount(problems.count);

            if (pagination.pageIndex * pagination.pageSize >= problems.count && pagination.pageIndex !== 0) {
                setPagination({
                    pageIndex: pagination.pageIndex - 1,
                    pageSize: pagination.pageSize,
                });
            }
        } catch (error) {
            console.log(error);
        }

        setAreProblemsLoading(false);
    };

    useEffect(() => {
        setAreProblemsLoading(true);
        getProblems();
    }, [pagination, filter]);

    useEffect(() => {
        table.setGlobalFilter(filter);
    }, [filter]);

    useEffect(() => {
        setPagination({ ...pagination, pageSize: pageSize });
    }, [pageSize]);

    const handleDeleteProblem = async (problem: Problem) => {
        modals.openConfirmModal({
            title: 'Delete problem',
            children: (
                <Text>
                    Are you sure you want to delete the problem{' '}
                    <Text span fw='bold'>
                        {problem.title}
                    </Text>
                    ?
                </Text>
            ),
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            confirmProps: { variant: 'subtle', color: 'red' },
            onConfirm: async () => {
                try {
                    await api.delete(`problems/${problem.id}`);
                    notifications.show({
                        title: 'Deleted',
                        message: 'Problem deleted succesfully!',
                        color: 'green',
                    });

                    await getProblems();
                } catch (error) {
                    console.log(error);
                }
            },
        });
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: '#',
                cell: (info: any) => <Text>{info.getValue()}</Text>,
            },
            {
                accessorKey: 'title',
                header: 'Title',
                cell: (info: any) => <Text fw='bold'>{info.getValue()}</Text>,
            },
            {
                accessorKey: 'points',
                header: 'Points',
                cell: (info: any) => <Text>{info.getValue()}</Text>,
            },
            {
                accessorKey: 'is_public',
                header: 'Public?',
                cell: (info: any) => (info.getValue() ? <FaCheck /> : <FaX />),
            },
        ],
        [],
    );

    const table = useReactTable({
        data: problems,
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
                            <Table.Th></Table.Th>
                        </Table.Tr>
                    ))}
                </Table.Thead>

                <Table.Tbody hidden={areProblemsLoading}>
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
                                    >
                                        <FaPenToSquare />
                                    </Button>
                                    <Button
                                        size='xs'
                                        variant='subtle'
                                        color='red'
                                        onClick={() =>
                                            handleDeleteProblem(row.original)
                                        }
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
                                    <Text c='dimmed'>No problems found.</Text>
                                </Center>
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        <></>
                    )}
                </Table.Tbody>

                <Table.Tbody hidden={!areProblemsLoading}>
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
