'use client';

import { useEffect, useMemo, useState } from 'react';
import { User, UserType } from '@/models/User';
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
    Checkbox,
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
    FaPenToSquare,
    FaSort,
    FaSortDown,
    FaSortUp,
    FaTrash,
} from 'react-icons/fa6';

import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

type UserTableProps = {
    filter: string;
    visibleColumns?: string[];
    showControls?: boolean;
    selectable?: boolean;
    selectedUserIds?: number[];
    onSelectionChange?: (selectedUserIds: number[]) => void;
};

export default function UsersTable({
    filter,
    visibleColumns,
    showControls = true,
    selectable = false,
    selectedUserIds = [],
    onSelectionChange,
}: UserTableProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<any>([]);
    const [areUsersLoading, setAreUsersLoading] = useState(true);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: pageSize,
    });
    const [rowCount, setRowCount] = useState(0);
    const [userTypes, setUserTypes] = useState<UserType[]>([]);
    const router = useRouter();
    const getUsers = async () => {
        try {
            const response = await api.get('users', {
                searchParams: {
                    limit: pagination.pageSize,
                    offset: pagination.pageIndex * pagination.pageSize,
                    search: filter,
                },
            });
            const users = await response.json<{
                data: User[];
                count: number;
            }>();
            setUsers(users.data);
            setRowCount(users.count);

            if (
                pagination.pageIndex * pagination.pageSize >= users.count &&
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

        setAreUsersLoading(false);
    };

    const handleSelectionChange = (userId: number, isSelected: boolean) => {
        let updatedSelection = new Set(selectedUserIds);

        if (isSelected) {
            updatedSelection.add(userId);
        } else {
            updatedSelection.delete(userId);
        }

        if (onSelectionChange) {
            onSelectionChange(Array.from(updatedSelection));
        }
    };

    useEffect(() => {
        setAreUsersLoading(true);
        getUsers();
    }, [pagination, filter, userTypes]);

    useEffect(() => {
        table.setGlobalFilter(filter);
    }, [filter]);

    useEffect(() => {
        setPagination({ ...pagination, pageSize: pageSize });
    }, [pageSize]);

    const handleDeleteUser = async (user: User) => {
        modals.openConfirmModal({
            title: 'Delete user',
            children: (
                <Text>
                    Are you sure you want to delete the user{' '}
                    <Text span fw='bold'>
                        {user.username}
                    </Text>
                    ?
                </Text>
            ),
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            confirmProps: { variant: 'subtle', color: 'red' },
            onConfirm: async () => {
                try {
                    await api.delete(`users/${user.id}`);
                    notifications.show({
                        title: 'Deleted',
                        message: 'User deleted successfully',
                        color: 'green',
                    });

                    await getUsers();
                } catch (error) {
                    console.log(error);
                }
            },
        });
    };

    const handleEditUser = async (user: User) => {
        router.push(`/admin/users/edit?id=${user.id}`);
    };

    useEffect(() => {
        getUserTypes();
    }, []);

    const columns = useMemo(
        () =>
            [
                {
                    accessorKey: 'id',
                    header: '#',
                    cell: (info: any) => <Text>{info.getValue()}</Text>,
                },
                {
                    accessorKey: 'username',
                    header: 'Username',
                    cell: (info: any) => <Text>{info.getValue()}</Text>,
                },
                {
                    accessorKey: 'email',
                    header: 'Email',
                    cell: (info: any) => <Text>{info.getValue()}</Text>,
                },
                {
                    accessorKey: 'registered_at',
                    header: 'Registered at',
                    cell: (info: any) => {
                        const rawDate = info.getValue();
                        const formattedDate = rawDate
                            ? dayjs(rawDate).format('DD/MM/YYYY HH:mm')
                            : 'N/A';
                        return <Text>{formattedDate}</Text>;
                    },
                },
                {
                    accessorKey: 'user_type_id',
                    header: 'User type',
                    cell: (info: any) => {
                        const userType = userTypes.find(
                            (type) => type.id === info.getValue(),
                        );
                        return <Text>{userType?.code}</Text>;
                    },
                },
            ].filter((column) =>
                visibleColumns
                    ? visibleColumns.includes(column.accessorKey)
                    : true,
            ),
        [userTypes],
    );

    const table = useReactTable({
        data: users,
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

    const getUserTypes = async () => {
        try {
            const response = await api.get('users/types/available');
            const availableUserTypes = await response.json<UserType[]>();
            setUserTypes(availableUserTypes);
        } catch (error) {
            console.error('Error fetching user types:', error);
        }
    };

    return (
        <Box>
            <Table highlightOnHover>
                <Table.Thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Table.Tr key={headerGroup.id}>
                            {selectable && <Table.Th></Table.Th>}
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
                <Table.Tbody hidden={areUsersLoading}>
                    {table.getRowModel().rows.map((row) => {
                        const userId = row.original.id;
                        return (
                            <Table.Tr key={row.id}>
                                {selectable && (
                                    <Table.Td>
                                        <Flex>
                                            <Checkbox
                                                checked={selectedUserIds.includes(
                                                    userId,
                                                )}
                                                onChange={(e) => {
                                                    handleSelectionChange(
                                                        userId,
                                                        e.target.checked,
                                                    );
                                                }}
                                            />
                                        </Flex>
                                    </Table.Td>
                                )}
                                {row.getVisibleCells().map((cell) => (
                                    <Table.Td key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext(),
                                        )}
                                    </Table.Td>
                                ))}
                                {showControls && (
                                    <Table.Td>
                                        <Flex>
                                            <Button
                                                size='xs'
                                                variant='subtle'
                                                color='blue'
                                                onClick={() =>
                                                    handleEditUser(row.original)
                                                }
                                            >
                                                <FaPenToSquare />
                                            </Button>
                                            <Button
                                                size='xs'
                                                variant='subtle'
                                                color='red'
                                                onClick={() =>
                                                    handleDeleteUser(
                                                        row.original,
                                                    )
                                                }
                                            >
                                                <FaTrash />
                                            </Button>
                                        </Flex>
                                    </Table.Td>
                                )}
                            </Table.Tr>
                        );
                    })}
                    {table.getRowModel().rows.length === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={columns.length + 1}>
                                <Center>
                                    <Text>No users found.</Text>
                                </Center>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
                <Table.Tbody hidden={!areUsersLoading}>
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
