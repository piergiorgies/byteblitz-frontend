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
import api from '@/utils/ky';
import { notifications } from '@mantine/notifications';
import { UserType } from '@/models/User';
import { useEffect, useState } from 'react';

export default function AddUsersPage() {
    const [userTypes, setUserTypes] = useState<UserType[]>([]);

    const userInfoForm = useForm({
        initialValues: {
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
                value.length >= 6 ? null : 'Password must be at least 6 characters long',
            confirmPassword: (value, values) => {
                if (value !== values.password) {
                    return 'Passwords do not match';
                }
                return null;
            },
            user_type_id: (value) => (value.trim() ? null : 'User Type is required'),
        },
    });

    // Submit handler
    const handleSubmit = async (values: typeof userInfoForm.values) => {
        try {
            await api.post('auth/signup', {
                json: {
                    username: values.username,
                    email: values.email,
                    password: values.password,
                    user_type_id: values.user_type_id,
                },
            })
            notifications.show({
                title: 'Success',
                message: 'User added successfully',
                color: 'green',
            });
            userInfoForm.reset();
        } catch (error) {
            console.error('Failed to add user:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to add user',
                color: 'red',
            });
        }
    };

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
        <Flex direction="column" gap="md">
            <form
                onSubmit={userInfoForm.onSubmit((values) => handleSubmit(values))}
            >
                <Title order={1}>User Info</Title>
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
                    <Select
                        label="User Type"
                        placeholder="Select user type"
                        data={userTypes.map((type) => ({ value: type.id.toString(), label: type.code }))}
                        {...userInfoForm.getInputProps('user_type_id')}
                    />

                </SimpleGrid>
                <Button type="submit" mt="xl">
                    Add User
                </Button>
            </form>
        </Flex>
    );
}
