import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/compat/router';
import { Button, Modal, TextInput, PasswordInput, Group } from '@mantine/core';
import api from '../../utils/ky';
import { useForm } from '@mantine/form';

export default function Navbar() {
    const [loginToken, setLoginToken] = useState<string>('');
    const [modalOpen, setModalOpen] = useState(false);
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            username: '',
            password: '',
        },
    });
    useEffect(() => {
        setLoginToken(localStorage.getItem('token') ?? '');
    }, []);

    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setLoginToken('');

        window.location.href = '/';
    };

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    const doLogin = async (values: any) => {
        try {
            const response = await api.post('auth/login', {
                json: {
                    username: values.username,
                    password: values.password,
                },
                cache: 'no-store', 
                credentials: 'include',
            });
            response.json().then((data: any) => {
                localStorage.setItem('token', data.access_token);
                setLoginToken(data.access_token);
            });
        } catch (error) {
            console.log(error);
        }

        closeModal();
    };

    return (
        <div className='flex h-full items-center justify-between'>
            <Link href='/' className='pl-4 pt-1 text-2xl'>
                ByteBlitz
            </Link>
            <div>
                {loginToken ? (
                    <Button
                        className='me-2'
                        variant='outline'
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                ) : (
                    <Button className='me-2' onClick={openModal}>
                        Login
                    </Button>
                )}
            </div>

            <Modal opened={modalOpen} onClose={closeModal} title='Login'>
                {/* Login form */}
                <form onSubmit={form.onSubmit(doLogin)}>
                    <TextInput
                        label='Email'
                        placeholder='Enter your email'
                        required
                        mb='sm'
                        key={form.key('username')}
                        {...form.getInputProps('username')}
                    />
                    <PasswordInput
                        label='Password'
                        placeholder='Enter your password'
                        required
                        mb='sm'
                        key={form.key('password')}
                        {...form.getInputProps('password')}
                    />
                    <Group mt='md'>
                        <Button onClick={closeModal}>Cancel</Button>
                        <Button type='submit'>Login</Button>
                    </Group>
                </form>
            </Modal>
        </div>
    );
}
