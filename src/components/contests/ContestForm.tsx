import { Button, SimpleGrid, TextInput, Title, Flex, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateTimePicker } from '@mantine/dates';
import { useEffect, useState } from 'react';
import { User } from '@/models/User';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import UsersTable from '../users/UsersTable';
import '@mantine/dates/styles.css';
import ProblemsTable from '../problems/ProblemsTable';

type ContestFormProps = {
    mode: 'add' | 'edit';
    initialValues?: {
        name: string;
        description: string;
        start_datetime: Date;
        end_datetime: Date;
        users: number[];
    };
    onSubmit: (values: any) => Promise<void>;
};

export default function ContestForm({
    mode,
    initialValues,
    onSubmit,
}: ContestFormProps) {
    const contestForm = useForm({
        initialValues: initialValues || {
            name: '',
            description: '',
            start_datetime: null,
            end_datetime: null,
            users: [],
        },
        validate: {
            name: (value) => (value.trim() ? null : 'Name is required'),
            description: (value) =>
                value.trim() ? null : 'Description is required',
            start_datetime: (value: Date | null) =>
                value ? null : 'Start time is required',
            end_datetime: (value: Date | null) =>
                value ? null : 'End time is required',
        },
    });

    const [searchUserQuery, setSearchUserQuery] = useState('');
    const [searchProblemQuery, setSearchProblemQuery] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>(
        initialValues?.users || [],
    );

    const handleUserSelect = (updatedUserIds: number[]) => {
        setSelectedUserIds(updatedUserIds);
    };

    useEffect(() => {
        contestForm.setFieldValue('users', selectedUserIds);
    }, [selectedUserIds]);

    useEffect(() => {
        if (initialValues?.users) {
            setSelectedUserIds(initialValues.users);
        }
    }, [initialValues]);

    const handleSearchUserKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            setSearchUserQuery(event.currentTarget.value.trim());
        }
    };
    const handleSearchProblemKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            setSearchProblemQuery(event.currentTarget.value.trim());
        }
    };

    return (
        <Box>
            <form onSubmit={contestForm.onSubmit(onSubmit)}>
                <Title order={2}>
                    {mode === 'add' ? 'Add contest' : 'Edit contest'}
                </Title>
                <SimpleGrid cols={2} spacing='lg'>
                    <TextInput
                        label='Name'
                        placeholder='Enter contest name'
                        required
                        {...contestForm.getInputProps('name')}
                    />
                    <TextInput
                        label='Description'
                        placeholder='Enter contest description'
                        required
                        {...contestForm.getInputProps('description')}
                    />
                    <DateTimePicker
                        label='Start date'
                        placeholder='Pick the start date and time'
                        required
                        {...contestForm.getInputProps('start_datetime')}
                    />
                    <DateTimePicker
                        label='End date'
                        placeholder='Pick the end date and time'
                        required
                        {...contestForm.getInputProps('end_datetime')}
                    />
                </SimpleGrid>

                <Title order={2} mt='xl'>
                    Contest users
                </Title>
                <TextInput
                    placeholder='Search users...'
                    leftSection={<FaMagnifyingGlass />}
                    onKeyDown={handleSearchUserKeyDown}
                />
                <UsersTable
                    filter={searchUserQuery}
                    visibleColumns={[
                        'select',
                        'username',
                        'email',
                        'user_type_id',
                    ]}
                    selectable={true}
                    showControls={false}
                    selectedUserIds={selectedUserIds}
                    onSelectionChange={handleUserSelect}
                />

                <Title order={2} mt='xl'>
                    Contest problems
                </Title>
                <TextInput
                    placeholder='Search problems...'
                    leftSection={<FaMagnifyingGlass />}
                    onKeyDown={handleSearchProblemKeyDown}
                />
                <ProblemsTable filter={searchProblemQuery} />

                <Button type='submit' mt='xl'>
                    {mode === 'add' ? 'Add Contest' : 'Save Changes'}
                </Button>
            </form>
        </Box>
    );
}
