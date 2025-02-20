import api from '@/utils/ky';
import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';

export default function ResetPasswordModal({
    showModal,
    closeModal,
}: {
    showModal: boolean;
    closeModal: () => void;
}) {
    const [successMessage, setSuccessMessage] = useState('');
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
            console.log(error);
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
                    <p style={{ color: 'green' }}>{successMessage}</p>
                )}

                <Group mt='md'>
                    <Button onClick={closeModal}>Cancel</Button>
                    <Button type='submit'>Send Reset Link</Button>
                </Group>
            </form>
        </Modal>
    );
}
