'use client';

import {
    Button,
    Divider,
    Flex,
    SimpleGrid,
    TextInput,
    Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import api from '@/utils/ky';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

export default function AddJudgesPage() {
    const router = useRouter();

    const judgeInfoForm = useForm({
        mode: 'uncontrolled',
        initialValues: {
            name: '',
            key: '',
        },
        validate: {
            name: (value) => (value.trim() ? null : 'Name is required'),
            key: (value) => (value.trim() ? null : 'Key is required'),
        },
    });

    const saveJudge = async (values: typeof judgeInfoForm.values) => {
        try {
            const response = await api.post('admin/judges', {
                json: {
                    name: values.name,
                    key: values.key,
                },
            });
            if (!response.ok) {
                throw new Error(response.statusText || 'An error occurred');
            }
            notifications.show({
                title: 'Judge added',
                message: 'Judge has been added successfully',
                color: 'teal',
            });
            judgeInfoForm.reset();
            router.push('/admin/judges');
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: `An error occurred: ${error.message}`,
                color: 'red',
            });
        }
    };

    return (
        <Flex direction={'column'} gap={'md'}>
            <form onSubmit={judgeInfoForm.onSubmit(saveJudge)}>
                <Title order={1}>Judge info</Title>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                    <TextInput
                        label={'Name'}
                        placeholder={'Name'}
                        key={judgeInfoForm.key('name')}
                        {...judgeInfoForm.getInputProps('name')}
                    />
                    <TextInput
                        label={'Key'}
                        placeholder={'Key of the judge'}
                        key={judgeInfoForm.key('key')}
                        {...judgeInfoForm.getInputProps('key')}
                    />
                </SimpleGrid>
                <Flex justify={'start'} mt={'md'}>
                    <Button type={'submit'}>Save</Button>
                </Flex>
            </form>
        </Flex>
    );
}
