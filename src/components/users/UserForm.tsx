'use client';
import {
    Button,
    Flex,
    SimpleGrid,
    TextInput,
    Title,
    PasswordInput,
    Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import api from '@/utils/ky';
import { UserType } from '@/models/User';

type UserFormProps = {
    mode: 'add' | 'edit';
    initialValues?: {
        username: string;
        email: string;
        password?: string;
        confirmPassword?: string;
        user_type_id: string;
    };
    onSubmit: (values: any) => Promise<void>;
};

export default function UserForm({ mode, initialValues, onSubmit }: UserFormProps) {
    const [userTypes, setUserTypes] = useState<UserType[]>([]);

    const userInfoForm = useForm({
        initialValues: initialValues || {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            user_type_id: '',
        },
        validate: {
            username: (value) => (value.trim() ? null : 'Name is required'),
            email: (value) =>
                /^\S+@\S+\.\S+$/.test(value.trim()) ? null : 'Invalid email address',
            password: (value) =>
                mode === 'add' && value && value.length < 6
                    ? 'Password must be at least 6 characters long'
                    : null,
            confirmPassword: (value, values) =>
                mode === 'add' && value !== values.password
                    ? 'Passwords do not match'
                    : null,
            user_type_id: (value) => (value.trim() ? null : 'User Type is required'),
        },
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

    useEffect(() => {
        getUserTypes();
    }, []);

    return (
        <form onSubmit={userInfoForm.onSubmit(onSubmit)}>
            <Title order={2}>{mode === 'add' ? 'Add User' : 'Edit User'}</Title>
            <SimpleGrid cols={2} spacing="lg">
                <TextInput
                    label="Username"
                    placeholder="Enter username"
                    {...userInfoForm.getInputProps('username')}
                />
                <TextInput
                    label="Email"
                    placeholder="Enter email"
                    {...userInfoForm.getInputProps('email')}
                />
                {mode === 'add' && (
                    <>
                        <PasswordInput
                            label="Password"
                            placeholder="Enter password"
                            {...userInfoForm.getInputProps('password')}
                        />
                        <PasswordInput
                            label="Confirm Password"
                            placeholder="Re-enter password"
                            {...userInfoForm.getInputProps('confirmPassword')}
                        />
                    </>
                )}
                <Select
                    label="User Type"
                    placeholder="Select user type"
                    data={userTypes.map((type) => ({
                        value: type.id.toString(),
                        label: type.code,
                    }))}
                    {...userInfoForm.getInputProps('user_type_id')}
                />
            </SimpleGrid>
            <Button type="submit" mt="xl">
                {mode === 'add' ? 'Add User' : 'Save Changes'}
            </Button>
        </form>
    );
}

