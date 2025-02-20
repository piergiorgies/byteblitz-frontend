import api from '@/utils/ky';
import { Button, Group, Modal, TextInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { HTTPError } from 'ky';
import { useState } from 'react';

export default function ResetPasswordModal({
    showModal,
    closeModal,
}: {
    showModal: boolean;
    closeModal: () => void;
}) {
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const resetForm = useForm({
        initialValues: {
            email: '',
        },
    });

    const handleReset = async (values: { email: string }) => {
        // Simulating API request (Replace with real API call)
        try {
            await api.post('auth/reset-password', {
                json: {
                    email: values.email,
                },
                cache: 'no-store',
                credentials: 'include',
            });
            setSuccessMessage(
                'If this email exists, a reset link has been sent.',
            );
        } catch (error) {
            if (error instanceof HTTPError && error.response.status === 400) {
                setErrorMessage('Email already sent. Check your inbox.');
            }
        }
    };

    return (
        <Modal opened={showModal} onClose={closeModal} title='Reset Password'>
            <form onSubmit={resetForm.onSubmit(handleReset)}>
                <TextInput
                    label='Email'
                    placeholder='Enter your email'
                    required
                    mb='sm'
                    {...resetForm.getInputProps('email')}
                />

                {successMessage && (
                    <Text c='green' mt='sm'>
                        {successMessage}
                    </Text>
                )}
                {errorMessage && (
                    <Text c='red' mt='sm'>
                        {errorMessage}
                    </Text>
                )}

                <Group mt='md'>
                    <Button onClick={closeModal}>Cancel</Button>
                    <Button type='submit'>Send Reset Link</Button>
                </Group>
            </form>
        </Modal>
    );
}
