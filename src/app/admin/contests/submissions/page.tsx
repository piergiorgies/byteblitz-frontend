'use client';
import ContestSubmissionsTable from "@/components/contests/ContestSubmissionTable";
import { Button, Flex, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

export default function ContestSubmissionsPage() {

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
                <form onSubmit={searchForm.onSubmit(onSubmitSearchQuery)}>
                    <TextInput
                        placeholder='Search'
                        leftSection={<FaMagnifyingGlass />}
                        key={searchForm.key('searchQuery')}
                        {...searchForm.getInputProps('searchQuery')}
                    />
                </form>
            </Flex>
            <ContestSubmissionsTable filter={searchQuery}></ContestSubmissionsTable>
        </>
    );
}