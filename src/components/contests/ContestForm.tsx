'use client';

import { Button, Flex, SimpleGrid, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateTimePicker } from '@mantine/dates';

type ContestFormProps = {
    mode: 'add' | 'edit';
    initialValues?: {
        name: string;
        description: string;
        start_time: string;
        end_time: string;
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
            start_time: '',
            end_time: '',
        },
        validate: {
            name: (value) => (value.trim() ? null : 'Name is required'),
            description: (value) => (value.trim() ? null : 'Description is required'),
            start_time: (value) => (value.trim() ? null : 'Start time is required'),
            end_time: (value) => (value.trim() ? null : 'End time is required'),
        },
    });

    return (
        <form onSubmit={contestForm.onSubmit(onSubmit)}>
            <SimpleGrid cols={1} spacing='lg'>
                <Title order={3}>Contest Information</Title>
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
            </SimpleGrid>
            <Button type='submit' mt='xl'>
                {mode === 'add' ? 'Add Contest' : 'Save Changes'}
            </Button>
        </form>
    );
}
