'use client';

import ProblemsTable from '@/components/problems/ProblemsTable';
import { Box, Button, Flex, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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

    return (
        <>
            <Flex justify='space-between' mb='md'>
                <Button leftSection={<FaPlus />} onClick={() => router.push('/admin/problems/add')}>Add new</Button>

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
