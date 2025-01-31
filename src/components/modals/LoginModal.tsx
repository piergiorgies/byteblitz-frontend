import api from '@/utils/ky';
import { Button, Group, Modal, PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';

type onModalClose = () => void;

export default function LoginModal({
    showModal,
    closeModal,
}: {
    showModal: boolean;
    closeModal: onModalClose;
}) {
    const router = useRouter();

    const loginForm = useForm({
        mode: 'uncontrolled',
        initialValues: {
            username: '',
            password: '',
        },
    });

    const doLogin = async (values: typeof loginForm.values) => {
        try {
            const response = await api.post('auth/login', {
                json: {
                    username: values.username,
                    password: values.password,
                },
                cache: 'no-store',
                credentials: 'include',
            });
            const data: { access_token: string } = await response.json();
            console.log(data);
            localStorage.setItem('token', data.access_token);
            router.refresh();
        } catch (error) {
            console.log(error);
        }

        closeModal();
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
                    mb='sm'
                    key={loginForm.key('password')}
                    {...loginForm.getInputProps('password')}
                />
                <Group mt='md'>
                    <Button onClick={closeModal}>Cancel</Button>
                    <Button type='submit'>Login</Button>
                </Group>
            </form>
        </Modal>
    );
}
