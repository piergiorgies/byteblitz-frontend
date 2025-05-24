import { ProblemSubmission, SubmissionResult } from '@/models/Submission';
import api from '@/utils/ky';
import {
    CellContext,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Center,
    Divider,
    Flex,
    Pagination,
    Select,
    Table,
    Text,
    Title,
    Tooltip,
} from '@mantine/core';
import dayjs from 'dayjs';
import SubmissionResultIcon from './SubmissionResult';
import { FaSort, FaSortDown, FaSortUp, FaUpload } from 'react-icons/fa6';
import { Language } from '@/models/Language';
import { objectToCamel } from 'ts-case-convert';
import { SubmissionContext } from '../contexts/SubmissionContext';

type SubmissionTableProps = {
    problemId: number;
};

export default function SubmissionWindow({ problemId }: SubmissionTableProps) {
    const [submissions, setSubmissions] = useState<ProblemSubmission[]>([]);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [areSubmissionsLoading, setAreSubmissionsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: pageSize,
    });
    const [rowCount, setRowCount] = useState(10);

    const { setCode, setSelectedLanguage } = useContext(SubmissionContext);

    const [submissionResults, setSubmissionResults] = useState<{
        [key: number]: SubmissionResult;
    } | null>(null);

    const [languages, setLanguages] = useState<Language[]>([]);

    const getLanguages = useCallback(async () => {
        try {
            const response = await api.get('problems/languages/available');
            const returnedLanguages = objectToCamel(
                await response.json<Language[]>(),
            );
            setLanguages(returnedLanguages);
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        getLanguages();
    }, [getLanguages]);

    const getSubmissionResults = useCallback(async () => {
        try {
            const response = await api.get('submissions/results');
            const submissionResultsList =
                await response.json<SubmissionResult[]>();
            const submissionResultsDict: { [key: number]: SubmissionResult } =
                {};

            for (const submissionResult of submissionResultsList) {
                submissionResultsDict[submissionResult.id] = submissionResult;
            }
            setSubmissionResults(submissionResultsDict);
        } catch (error) {
            console.log(error);
        }
    }, [problemId]);

    useEffect(() => {
        getSubmissionResults();
    }, [getSubmissionResults]);

    const getSubmissions = async () => {
        try {
            const response = await api.get(`submissions/problem/${problemId}`, {
                searchParams: {
                    limit: pagination.pageSize,
                    offset: pagination.pageSize * pagination.pageIndex,
                },
            });

            const submissions = await response.json<{
                submissions: ProblemSubmission[];
                count: number;
            }>();

            setSubmissions(submissions.submissions);
            setRowCount(submissions.count);

            if (
                pagination.pageIndex * pagination.pageSize >=
                    submissions.count &&
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
        getSubmissions();
    }, [pagination]);

    useEffect(() => {
        setPagination({ ...pagination, pageSize: pageSize });
    }, [pageSize]);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'submission_result_id',
                header: 'Result',
                cell: (info: CellContext<ProblemSubmission, number>) => {
                    const resultId = info.getValue();
                    return (
                        <SubmissionResultIcon
                            resultId={resultId}
                            submissionResults={submissionResults}
                        />
                    );
                },
            },
            {
                accessorKey: 'language_id',
                header: 'Language',
                cell: (info: CellContext<ProblemSubmission, number>) => (
                    <Text>
                        {
                            languages.find(
                                (language) => language.id === info.getValue(),
                            )?.name
                        }
                    </Text>
                ),
            },
            {
                accessorKey: 'created_at',
                header: 'Created At',
                cell: (info: any) => {
                    const rawDate = info.getValue();
                    const formattedDate = rawDate
                        ? dayjs(rawDate).format('YYYY-MM-DD HH:mm:ss')
                        : 'N/A';
                    return <Text>{formattedDate}</Text>;
                },
            },
            {
                accessorKey: 'score',
                header: 'Score',
                cell: (info: CellContext<ProblemSubmission, number>) => (
                    <Text>{info.getValue()} pts</Text>
                ),
            },
        ],
        [submissionResults],
    );

    const onClickLoadCode = (code: string, language_id: number) => {
        setCode(code);
        const selectedLanguage = languages.find(
            (language) => language.id === language_id,
        );
        if (selectedLanguage) {
            setSelectedLanguage(selectedLanguage);
        }
    };

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
        <Box m={10}>
            <Center>
                <Title p={10} fs='italic'>
                    Submissions
                </Title>
            </Center>
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
                                    <Tooltip label='Load code'>
                                        <Button
                                            size='sx'
                                            variant='subtle'
                                            color='grey'
                                            onClick={() => {
                                                onClickLoadCode(
                                                    row.original.submitted_code,
                                                    row.original.language_id,
                                                );
                                            }}
                                        >
                                            <FaUpload />
                                        </Button>
                                    </Tooltip>
                                </Flex>
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
                    onChange={(value) =>
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
