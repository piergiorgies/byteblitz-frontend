'use client';

import { Button, SimpleGrid, TextInput, Title, MultiSelect } from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateTimePicker } from '@mantine/dates';
import '@mantine/dates/styles.css';
import { useEffect, useState } from "react";
import { User } from "@/models/User";
import api from "@/utils/ky";
import { useDebouncedValue } from "@mantine/hooks";
import { FaMagnifyingGlass } from "react-icons/fa6";

type ContestFormProps = {
    mode: 'add' | 'edit';
    initialValues?: {
        name: string;
        description: string;
        start_datetime: Date;
        end_datetime: Date;
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
            description: (value) => (value.trim() ? null : 'Description is required'),
            start_datetime: (value: Date | null) => (value ? null : 'Start time is required'),
            end_datetime: (value: Date | null) => (value ? null : 'End time is required'),
        },
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery] = useDebouncedValue(searchQuery, 400);
    const [users, setUsers] = useState<User[]>([]);
    const searchForm = useForm({
        mode: 'uncontrolled',
        initialValues: {
            searchQuery: '',
        },
    });

    const getUsers = async (query: string) => {
        try {
            const response = await api.get('users', {
                searchParams: {
                    limit: 5,
                    offset: 0,
                    search: query,
                },
            });
            const data = await response.json<{ data: User[] }>();
            setUsers(data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getUsers(debouncedQuery.trim());
    }, [debouncedQuery]);

    return (
        <form onSubmit={contestForm.onSubmit(onSubmit)}>
            <Title order={2}>{mode === 'add' ? 'Add contest' : 'Edit contest'}</Title>
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
                    placeholder="Pick the end date and time"
                    required
                    {...contestForm.getInputProps('end_datetime')}
                />
            </SimpleGrid>
            <Title order={2} mt='xl'>Contest users</Title>
            <TextInput
                placeholder='Search'
                leftSection={<FaMagnifyingGlass />}
                key={searchForm.key('searchQuery')}
                {...searchForm.getInputProps('searchQuery')}
            />
            <Button type='submit' mt='xl'>
                {mode === 'add' ? 'Add Contest' : 'Save Changes'}
            </Button>
        </form>
    );
}
