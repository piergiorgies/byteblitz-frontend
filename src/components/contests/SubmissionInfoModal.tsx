'use client';

import {
    Box,
    Center,
    Code,
    Loader,
    Modal,
    Text,
    Table,
    Tooltip,
} from '@mantine/core';
import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { SubmissionInfo } from '@/models/Contest';
import SubmissionResultIcon from '../submission/SubmissionResult';

interface SubmissionInfoModalProps {
    opened: boolean;
    onClose: () => void;
    isLoading: boolean;
    submissionId: number | null;
    data?: SubmissionInfo;
}

export default function SubmissionInfoModal({
    opened,
    onClose,
    isLoading,
    submissionId,
    data,
}: SubmissionInfoModalProps) {
    const columns = useMemo(
        () => [
            {
                accessorKey: 'number',
                header: '#',
                cell: (info: any) => info.getValue(),
            },
            {
                accessorKey: 'memory',
                header: 'Memory (MB)',
                cell: (info: any) => info.getValue(),
            },
            {
                accessorKey: 'time',
                header: 'Time (ms)',
                cell: (info: any) => info.getValue().toFixed(3),
            },
            {
                accessorKey: 'notes',
                header: 'Notes',
                cell: (info: any) => {
                    const value = info.getValue();
                    return (
                        <Tooltip label={value} withArrow>
                            <Text
                                style={{
                                    maxWidth: '200px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {value.length > 50 ? `${value.slice(0, 50)}...` : value}
                            </Text>
                        </Tooltip>
                    );
                },
            },
            {
                accessorKey: 'result_code',
                header: 'Result ID',
                cell: (info: any) => <SubmissionResultIcon label={info.getValue()} />,
            },
        ],
        [],
    );

    const table = useReactTable({
        data: data?.test_case_results ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Submission #${submissionId}`}
            size="lg"
        >
            {isLoading ? (
                <Center>
                    <Loader />
                </Center>
            ) : data ? (
                <Box>
                    <Text fw={500} mb="sm">
                        Submitted Code:
                    </Text>
                    <Code block mb="md">
                        {data.code}
                    </Code>

                    <Text fw={500} mb="sm">
                        Test Case Results:
                    </Text>
                    <Table highlightOnHover>
                        <Table.Thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <Table.Tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <Table.Th key={header.id}>
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
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
                                                cell.getContext()
                                            )}
                                        </Table.Td>
                                    ))}
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Box>
            ) : (
                <Text c="red">Failed to load submission details.</Text>
            )}
        </Modal>
    );
}
