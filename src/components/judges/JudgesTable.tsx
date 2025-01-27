'use client';

import { Judge } from '@/models/Judge';
import { useEffect, useMemo, useState } from 'react';
import api from '@/utils/ky';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';
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
    FaCircle,
    FaPenToSquare,
    FaSort,
    FaSortDown,
    FaSortUp,
    FaTrash,
} from 'react-icons/fa6';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

export default function JudgesTable({ filter }: { filter: string }) {
    const [judges, setJudges] = useState<Judge[]>([]);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<any>([]);
    const [areJudgesLoading, setAreJudgesLoading] = useState(true);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: pageSize,
    });
    const [rowCount, setRowCount] = useState(0);

    const getJudges = async () => {
        try {
            const response = await api.get('judges', {
                searchParams: {
                    limit: pagination.pageSize,
                    offset: pagination.pageIndex * pagination.pageSize,
                    search: filter,
                },
            });

            const problems = await response.json<{
                data: Judge[];
                count: number;
            }>();
            setJudges(problems.data);
            setRowCount(problems.count);

            if (
                pagination.pageIndex * pagination.pageSize >= problems.count &&
                pagination.pageIndex !== 0
            ) {
                setPagination({
                    pageIndex: pagination.pageIndex - 1,
                    pageSize: pagination.pageSize,
                });
            }
        } catch (error) {
            console.error('Error loading judges', error);
        }

        setAreJudgesLoading(false);
    };

    useEffect(() => {
        setAreJudgesLoading(true);
        getJudges();
    }, [pagination, filter]);

    useEffect(() => {
        table.setGlobalFilter(filter);
    }, [filter]);

    useEffect(() => {
        setPagination({ ...pagination, pageSize: pageSize });
    }, [pageSize]);

    const handleDeleteJudge = async (judge: Judge) => {
        modals.openConfirmModal({
            title: 'Delete judge',
            children: (
                <Text>
                    Are you sure you want to delete the judge{' '}
                    <Text span fw='bold'>
                        {judge.name}
                    </Text>
                    ?
                </Text>
            ),
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            confirmProps: { variant: 'subtle', color: 'red' },
            onConfirm: async () => {
                try {
                    await api.delete(`judges/${judge.id}`);

                    notifications.show({
                        title: 'Deleted',
                        message: 'Problem deleted succesfully!',
                        color: 'green',
                    });

                    await getJudges();
                } catch (error) {
                    console.error('Error deleting judge', error);
                }
            },
        });
    };

    const columns = useMemo(
        () => [
            {
                header: '#',
                accessorKey: 'id',
                cell: (info: any) => <Text>{info.getValue()}</Text>,
            },
            {
                header: 'Name',
                accessorKey: 'name',
                cell: (info: any) => <Text fw='bold'>{info.getValue()}</Text>,
            },
            {
                header: 'Last Connection',
                accessorKey: 'last_connection',
                cell: (info: any) => {
                    const rawDate = info.getValue();
                    const formattedDate = rawDate
                        ? dayjs(rawDate).format('DD/MM/YYYY HH:mm')
                        : 'N/A'; // Fallback if the date is null or undefined
                    return <Text>{formattedDate}</Text>;
                },
            },
            {
                header: 'Status',
                accessorKey: 'status',
                cell: (info: any) =>
                    info.getValue() ? (
                        <FaCircle color='green' />
                    ) : (
                        <FaCircle color='red' />
                    ),
            },
        ],
        [],
    );

    const table = useReactTable({
        data: judges,
        columns: columns,
        state: {
            sorting,
            pagination,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getCoreRowModel(),
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

                <Table.Tbody hidden={areJudgesLoading}>
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
                                    {/* <Button
                                        size='xs'
                                        variant='subtle'
                                        color='blue'
                                        onClick={() =>
                                            handleEditJudge(row.original)
                                        }
                                    >
                                        <FaPenToSquare />
                                    </Button> */}
                                    <Button
                                        size='xs'
                                        variant='subtle'
                                        color='red'
                                        onClick={() =>
                                            handleDeleteJudge(row.original)
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
                                    <Text c='dimmed'>No judges found.</Text>
                                </Center>
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        <></>
                    )}
                </Table.Tbody>
                <Table.Tbody hidden={!areJudgesLoading}>
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
