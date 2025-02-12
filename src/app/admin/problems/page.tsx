'use client';

import ProblemsTable from '@/components/problems/ProblemsTable';
import { Button, Flex, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaMagnifyingGlass, FaPlus } from 'react-icons/fa6';

export default function ProblemsPage() {
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const searchForm = useForm({
        mode: 'uncontrolled',
        initialValues: {
            searchQuery: '',
        },
    });

    const onSubmitSearchQuery = (values: typeof searchForm.values) => {
        setSearchQuery(values.searchQuery);
    };

    useEffect(() => {
        const storedData = localStorage.getItem('problemCreated');

        if (storedData) {
            const { success, erroredTestCases } = JSON.parse(storedData);

            if (success) {
                notifications.show({
                    title: 'Success',
                    message: 'Problem created successfully!',
                    color: 'green',
                });
            }

            if (erroredTestCases.length > 0) {
                notifications.show({
                    title: 'Warning',
                    message: `Some test cases failed to save: ${erroredTestCases.map((x: number) => `#${x}`).join(', ')}`,
                    color: 'orange',
                });
            }

            localStorage.removeItem('problemCreated');
        }
    }, []);

    return (
        <>
            <Flex justify='space-between' mb='md'>
                <Button
                    leftSection={<FaPlus />}
                    onClick={() => router.push('/admin/problems/add')}
                >
                    Add new
                </Button>

                <form onSubmit={searchForm.onSubmit(onSubmitSearchQuery)}>
                    <TextInput
                        placeholder='Search'
                        leftSection={<FaMagnifyingGlass />}
                        key={searchForm.key('searchQuery')}
                        {...searchForm.getInputProps('searchQuery')}
                    />
                </form>
            </Flex>

            <ProblemsTable filter={searchQuery} />
        </>
    );
}
