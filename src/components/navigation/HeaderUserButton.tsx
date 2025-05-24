import UserRoles from '@/models/UserRoles';
import { Button, Menu } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import {
    FaArrowRightFromBracket,
    FaArrowRightToBracket,
    FaChevronRight,
    FaLock,
    FaUser,
} from 'react-icons/fa6';
import LoginModal from '../modals/LoginModal';
import ResetPasswordModal from '../modals/ResetPasswordModal';
import api from '@/utils/ky';

export default function HeaderUserButton({
    username,
    userPermissions,
}: {
    username: string | null;
    userPermissions: number | null;
}) {
    const router = useRouter();
    const [loginModalOpened, { open: openLoginModal, close: closeLoginModal }] =
        useDisclosure(false);
    const [resetModalOpened, { open: openResetModal, close: closeResetModal }] =
        useDisclosure(false);

    if (username == null || userPermissions == null) {
        return (
            <>
                <LoginModal
                    showModal={loginModalOpened}
                    closeModal={closeLoginModal}
                    openResetModal={() => {
                        closeLoginModal();
                        openResetModal();
                    }}
                />
                <ResetPasswordModal
                    showModal={resetModalOpened}
                    closeModal={closeResetModal}
                />
                <Button
                    leftSection={<FaArrowRightToBracket />}
                    onClick={openLoginModal}
                >
                    Login
                </Button>
            </>
        );
    }

    const logout = async () => {
        try {
            await api.get('auth/logout', {
                credentials: 'include',
            });
            router.refresh();
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Menu>
            <Menu.Target>
                <Button leftSection={<FaUser />}>{username}</Button>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<FaUser />}
                    rightSection={<FaChevronRight />}
                    onClick={() => router.push('/user/profile')}
                >
                    Profile
                </Menu.Item>

                {userPermissions >= UserRoles.PROBLEM_MAINTAINER ? (
                    <Menu.Item
                        leftSection={<FaLock />}
                        rightSection={<FaChevronRight />}
                        onClick={() => router.push('/admin')}
                    >
                        Admin
                    </Menu.Item>
                ) : null}

                <Menu.Divider />

                <Menu.Item
                    color='red'
                    leftSection={<FaArrowRightFromBracket />}
                    rightSection={<FaChevronRight />}
                    onClick={logout}
                >
                    Logout
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}
