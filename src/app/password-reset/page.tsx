'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from '@mantine/form';
import {
    Button,
    Group,
    Container,
    PasswordInput,
    Center,
    Title,
    Text,
    Paper,
    Stack,
} from '@mantine/core';
import api from '@/utils/ky';

export default function ChangeResetPasswordPage() {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get('token');

    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!token) {
            router.replace('/'); // Redirect if no token
        }
    }, [token, router]);

    const resetForm = useForm({
        initialValues: {
            password: '',
            confirmPassword: '',
        },
        validate: {
            password: (value) =>
                value.length < 6
                    ? 'Password must be at least 6 characters'
                    : null,
            confirmPassword: (value, values) =>
                value !== values.password ? 'Passwords do not match' : null,
        },
    });

    const handleChange = async (values: {
        password: string;
        confirmPassword: string;
    }) => {
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await api.post('auth/change-reset-password', {
                json: { password: values.password, token },
                cache: 'no-store',
                credentials: 'include',
            });
            setSuccessMessage(
                'Your password has been successfully reset. You can now log in.',
            );

            // Redirect to login page after 3 seconds
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (error) {
            setErrorMessage(
                'Error resetting password. The link may be expired or invalid.',
            );
        }
    };

    if (!token) {
        return null; // Prevent rendering if redirecting
    }

    return (
        <Container size={500} my={40}>
            <Center>
                <Paper withBorder shadow='md' p={30} radius='md' w='100%'>
                    <Title order={2} mb='sm'>
                        Reset Password
                    </Title>
                    <Text c='dimmed' mb='lg'>
                        Enter a new password for your account.
                    </Text>

                    <form onSubmit={resetForm.onSubmit(handleChange)}>
                        <Stack>
                            <PasswordInput
                                label='New Password'
                                placeholder='Enter your new password'
                                required
                                {...resetForm.getInputProps('password')}
                            />
                            <PasswordInput
                                label='Confirm Password'
                                placeholder='Confirm your new password'
                                required
                                {...resetForm.getInputProps('confirmPassword')}
                            />

                            {errorMessage && (
                                <Text c='red'>{errorMessage}</Text>
                            )}
                            {successMessage && (
                                <Text c='green'>{successMessage}</Text>
                            )}

                            <Group mt='md' justify='space-between'>
                                <Button
                                    variant='default'
                                    onClick={() => router.push('/')}
                                >
                                    Back to Homepage
                                </Button>
                                <Button type='submit'>Reset Password</Button>
                            </Group>
                        </Stack>
                    </form>
                </Paper>
            </Center>
        </Container>
    );
}
