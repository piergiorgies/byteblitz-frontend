import api from '@/utils/ky';
import {
    Button,
    Group,
    Modal,
    PasswordInput,
    Text,
    TextInput,
    Divider,
    Space,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaGithub } from 'react-icons/fa6';

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

    // Standard login with email/password
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
            router.refresh();
            closeModal();
        } catch (error) {
            setErrorMessage(
                (error as Error).message || 'Login failed. Please try again.',
            );
        }
    };

    // Redirect to GitHub OAuth
    const loginWithGitHub = async () => {
        try {
            const response = await api.get("auth/github");
            const data: { auth_url: string } = await response.json();
            window.location.href = data.auth_url;
        } catch (error) {
            setErrorMessage("GitHub login failed. Please try again.");
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

                <Text
                    size='sm'
                    c='blue'
                    style={{ cursor: 'pointer' }}
                    onClick={openResetModal}
                >
                    Forgot your password?
                </Text>

                {errorMessage && (
                    <Text c='red' size='sm' mt='sm'>
                        {errorMessage}
                    </Text>
                )}

                <Group grow mt='md'>
                    <Button onClick={closeModal}>Cancel</Button>
                    <Button type='submit'>Login</Button>
                </Group>

                <Divider my='md' label='OR' labelPosition='center' />

                <Button
                    fullWidth
                    variant='default'
                    onClick={loginWithGitHub}
                >
                    Login with GitHub
                    <Space w='xs' />
                    <FaGithub size={20} />
                </Button>
            </form>
        </Modal>
    );
}
