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
import api from '@/utils/ky';

export default function HeaderUserButton({
    username,
    userPermissions,
}: {
    username: string | null;
    userPermissions: number | null;
}) {
    const router = useRouter();

    if (username == null || userPermissions == null) {
        const [
            loginModalOpened,
            { open: openLoginModal, close: closeLoginModal },
        ] = useDisclosure(false);

        return (
            <>
                <LoginModal
                    showModal={loginModalOpened}
                    closeModal={closeLoginModal}
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
                ) : (
                    <></>
                )}

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
