import { SubmissionDetail } from '@/models/Submission';
import api from '@/utils/ky';
import {
    CellContext,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    ColumnDef,
} from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Divider,
    Flex,
    Pagination,
    Select,
    Table,
    Text,
} from '@mantine/core';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa6';
import SubmissionResultIcon from '../submission/SubmissionResult';

export default function SubmissionHistoryTable() {
    const [submissions, setSubmissions] = useState<SubmissionDetail[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    });
    const [rowCount, setRowCount] = useState(0);

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('users/sub_history', {
                searchParams: {
                    limit: pagination.pageSize,
                    offset: pagination.pageIndex * pagination.pageSize,
                },
            });
            const data = await response.json<{
                submissions: SubmissionDetail[];
                count: number;
            }>();

            setSubmissions(data.submissions);
            setRowCount(data.count);

            if (
                pagination.pageIndex * pagination.pageSize >= data.count &&
                pagination.pageIndex !== 0
            ) {
                setPagination((prev) => ({
                    ...prev,
                    pageIndex: prev.pageIndex - 1,
                }));
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const columns = useMemo<ColumnDef<SubmissionDetail>[]>(
        () => [
            {
                accessorKey: 'created_at',
                header: 'Created At',
                cell: (info: any) => (
                    <Text>{new Date(info.getValue()).toLocaleString()}</Text>
                ),
            },
            {
                accessorKey: 'problem_title',
                header: 'Problem',
                cell: (info: any) => <Text>{info.getValue()}</Text>,
            },
            {
                accessorKey: 'result_code',
                header: 'Result',
                cell: (info: any) => (
                    <SubmissionResultIcon label={info.getValue()} />
                ),
            },
            {
                accessorKey: 'execution_time',
                header: 'Execution Time (s)',
                cell: (info: any) => <Text>{info.getValue().toFixed(3)}</Text>,
            },
            {
                accessorKey: 'memory',
                header: 'Memory (MB)',
                cell: (info: any) => (
                    <Text>{(info.getValue() / 1024).toFixed(2)}</Text>
                ),
            },
            {
                accessorKey: 'language_name',
                header: 'Language',
                cell: (info: any) => <Text>{info.getValue()}</Text>,
            },
        ],
        [],
    );

    const table = useReactTable({
        data: submissions,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        pageCount: Math.ceil(rowCount / pagination.pageSize),
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
                <Table.Tbody>
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
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <Divider my='md' />

            <Flex justify='space-between'>
                <Select
                    data={[
                        { value: '10', label: '10' },
                        { value: '20', label: '20' },
                        { value: '50', label: '50' },
                    ]}
                    defaultValue={'20'}
                    value={pagination.pageSize.toString()}
                    onChange={(value) =>
                        setPagination((prev) => ({
                            pageIndex: 0,
                            pageSize: value == null ? 10 : parseInt(value),
                        }))
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
