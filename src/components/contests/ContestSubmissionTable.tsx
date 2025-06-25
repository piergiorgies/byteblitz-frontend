'use client';

import {
    Box,
    Button,
    Center,
    Code,
    Divider,
    Flex,
    Loader,
    Modal,
    Pagination,
    Select,
    Skeleton,
    Space,
    Table,
    Text,
    Tooltip,
} from '@mantine/core';
import { ContestSubmission, SubmissionInfo } from '@/models/Contest';
import api from '@/utils/ky';
import { useEffect, useMemo, useState } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import dayjs from 'dayjs';
import {
    FaInfo,
    FaSort,
    FaSortDown,
    FaSortUp,
} from 'react-icons/fa6';
import { useSearchParams } from 'next/navigation';
import SubmissionResultIcon from '../submission/SubmissionResult';
import SubmissionInfoModal from './SubmissionInfoModal';

export default function ContestSubmissionsTable({ filter }: { filter: string }) {
    const [submissions, setSubmissions] = useState<ContestSubmission[]>([]);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<any>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: pageSize,
    });
    const [rowCount, setRowCount] = useState(0);
    const searchParams = useSearchParams();
    const contestId = searchParams.get('id');
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
    const [modalData, setModalData] = useState<SubmissionInfo>();
    const [isModalLoading, setIsModalLoading] = useState(false);

    const [areSubmissionsLoading, setAreSubmissionsLoading] = useState(true);

    const getContestSubmissions = async () => {
        try {
            const response = await api.get(`admin/contests/${contestId}/submissions`, {
                searchParams: {
                    limit: pagination.pageSize,
                    offset: pagination.pageIndex * pagination.pageSize,
                    filter: filter,
                },
            });

            const contests = await response.json<{
                submissions: ContestSubmission[];
                count: number;
            }>();
            setSubmissions(contests.submissions);
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

        setAreSubmissionsLoading(false);
    };

    useEffect(() => {
        setAreSubmissionsLoading(true);
        getContestSubmissions();
    }, [pagination, filter, contestId]);

    useEffect(() => {
        table.setGlobalFilter(filter);
    }, [filter]);

    useEffect(() => {
        setPagination({ ...pagination, pageSize: pageSize });
    }, [pageSize]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'id',
                header: '#',
                cell: (info: any) => <Text>{info.getValue()}</Text>,
            },
            {
                accessorKey: 'created_at',
                header: 'Submission Date',
                cell: (info: any) => {
                    const rawDate = info.getValue();
                    const formattedDate = rawDate
                        ? dayjs(rawDate).format('YYYY-MM-DD HH:mm:ss')
                        : 'N/A';
                    return <Text>{formattedDate}</Text>;
                },
            },
            {
                accessorKey: 'problem_title',
                header: 'Problem',
                cell: (info: any) => {
                    const title = info.getValue();
                    return (
                        <Tooltip
                            label={title}
                            withinPortal
                            openDelay={400}
                            transitionProps={{ transition: 'pop' }}
                        >
                            <Text>
                                {title.length > 50
                                    ? title.substring(0, 50) + '...'
                                    : title}
                            </Text>
                        </Tooltip>
                    );
                },
            },
            {
                accessorKey: 'username',
                header: 'User',
                cell: (info: any) => <Text>{info.getValue()}</Text>,
            },
            {
                accessorKey: 'status',
                header: 'End Date',
                cell: (info: any) => <SubmissionResultIcon label={info.getValue()} />,
            },
            {
                accessorKey: 'score',
                header: 'Score',
                cell: (info: any) => <Text>{info.getValue()}</Text>,
            },
        ],
        [],
    );

    const fetchSubmissionInfo = async (id: number) => {
        setIsModalLoading(true);
        try {

            const response = await api.get(`admin/contests/submission/info/${id}`);
            const data = await response.json<SubmissionInfo>();
            if (!data) {
                throw new Error('Submission details not found');
            }
            setModalData(data);
        } catch (error) {
            console.error('Failed to fetch submission details:', error);
        }
        setIsModalLoading(false);
    };

    const handleInfoClick = (id: number) => {
        setSelectedSubmissionId(id);
        setModalOpened(true);
        fetchSubmissionInfo(id);
    }

    const table = useReactTable({
        data: submissions,
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
        <>
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

                    <Table.Tbody hidden={areSubmissionsLoading}>
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
                                            color='green'
                                            onClick={() => {
                                                handleInfoClick(row.original.id);
                                            }}
                                        >
                                            <FaInfo />
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

                    <Table.Tbody hidden={!areSubmissionsLoading}>
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
            <SubmissionInfoModal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                isLoading={isModalLoading}
                submissionId={selectedSubmissionId}
                data={modalData}
            />
        </>
    );
}
