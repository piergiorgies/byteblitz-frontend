import api from '@/utils/ky';
import { Button, Group, PasswordInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useEffect, useState } from 'react';

type ChangePasswordProps = {
    has_password: boolean;
};

export default function ChangePasswordForm({
    has_password,
}: ChangePasswordProps) {
    const form = useForm({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },

        validate: {
            newPassword: (value) =>
                value.length < 6
                    ? 'Password must be at least 6 characters'
                    : null,
            confirmPassword: (value, values) =>
                value !== values.newPassword ? 'Passwords do not match' : null,
        },
    });

    const [showForm, setShowForm] = useState(false);
    const handleToggleForm = () => {
        setShowForm((prev) => !prev);
    };

    const handleSubmit = async (values: typeof form.values) => {
        try {
            const res = await api.post('auth/change-password', {
                json: {
                    old_password: has_password ? values.currentPassword : '',
                    new_password: values.newPassword,
                },
            });

            if (res.ok) {
                form.reset();
                showNotification({
                    title: 'Password changed',
                    message: 'You have changed your password ',
                    color: 'green',
                });
            } else {
                showNotification({
                    title: 'Error during the request',
                    message: 'There was an error processing the request',
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
                {!showForm && (
                    <Button
                        onClick={() => handleToggleForm()}
                        variant='outline'
                        size='sm'
                    >
                        {has_password ? 'Change Password' : 'Set Password'}
                    </Button>
                )}
                {showForm && (
                    <>
                        {has_password && (
                            <PasswordInput
                                label='Current Password'
                                {...form.getInputProps('currentPassword')}
                                required
                            />
                        )}
                        <PasswordInput
                            label='New Password'
                            {...form.getInputProps('newPassword')}
                            required
                        />
                        <PasswordInput
                            label='Confirm New Password'
                            {...form.getInputProps('confirmPassword')}
                            required
                        />
                        <Group mt='sm'>
                            <Button type='submit' variant='filled'>
                                Change Password
                            </Button>
                            <Button
                                variant='outline'
                                onClick={() => handleToggleForm()}
                                color='red'
                            >
                                Cancel
                            </Button>
                        </Group>
                    </>
                )}
            </Stack>
        </form>
    );
}
