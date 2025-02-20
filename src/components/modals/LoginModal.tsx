import api from '@/utils/ky';
import {
    Button,
    Group,
    Modal,
    PasswordInput,
    Text,
    TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type onModalClose = () => void;

export default function LoginModal({
    showModal,
    closeModal,
    openResetModal,
}: {
    showModal: boolean;
    closeModal: onModalClose;
    openResetModal: () => void;
}) {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState('');

    const loginForm = useForm({
        mode: 'uncontrolled',
        initialValues: {
            username: '',
            password: '',
        },
    });

    const doLogin = async (values: typeof loginForm.values) => {
        setErrorMessage('');

        try {
            const response = await api.post('auth/login', {
                json: {
                    username: values.username,
                    password: values.password,
                },
                cache: 'no-store',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Invalid username or password');
            }

            const data: { access_token: string } = await response.json();
            localStorage.setItem('token', data.access_token);
            router.refresh();
            closeModal();
        } catch (error) {
            setErrorMessage(
                (error as Error).message || 'Login failed. Please try again.',
            );
        }
    };

    return (
        <Modal opened={showModal} onClose={closeModal}>
            <form onSubmit={loginForm.onSubmit(doLogin)}>
                <TextInput
                    label='Email'
                    placeholder='Enter your email'
                    required
                    mb='sm'
                    key={loginForm.key('username')}
                    {...loginForm.getInputProps('username')}
                />
                <PasswordInput
                    label='Password'
                    placeholder='Enter your password'
                    required
                    mb='xs'
                    key={loginForm.key('password')}
                    {...loginForm.getInputProps('password')}
                />

                {/* Forgot Password Link */}
                <Text
                    size='sm'
                    color='blue'
                    style={{ cursor: 'pointer' }}
                    onClick={openResetModal} // Open reset modal
                >
                    Forgot your password?
                </Text>

                {errorMessage && (
                    <Text color='red' size='sm' mt='sm'>
                        {errorMessage}
                    </Text>
                )}

                <Group mt='md'>
                    <Button onClick={closeModal}>Cancel</Button>
                    <Button type='submit'>Login</Button>
                </Group>
            </form>
        </Modal>
    );
}
