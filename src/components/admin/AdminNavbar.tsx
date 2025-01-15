'use client';

import UserRoles from '@/models/UserRoles';
import { NavLink, Text } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { FaChevronRight, FaGavel, FaQuestion, FaTrophy, FaUsers } from 'react-icons/fa6';
export default function AdminNavbar({
    userPermissions,
}: {
    userPermissions: number;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const hasPermission = (userBitmask: number, permissionBitmask: number) =>
        (userBitmask & permissionBitmask) === permissionBitmask;

    return (
        <>
            {hasPermission(userPermissions, UserRoles.CONTEST_MAINTAINER) ? (
                <NavLink
                    label={<Text size='lg'>Contests</Text>}
                    leftSection={<FaTrophy />}
                    rightSection={<FaChevronRight />}
                    onClick={() => router.push('/admin/contests')}
                    active={pathname.startsWith('/admin/contests')}
                />
            ) : (
                <></>
            )}

            {hasPermission(userPermissions, UserRoles.PROBLEM_MAINTAINER) ? (
                <NavLink
                    label={<Text size='lg'>Problems</Text>}
                    leftSection={<FaQuestion />}
                    rightSection={<FaChevronRight />}
                    onClick={() => router.push('/admin/problems')}
                    active={pathname.startsWith('/admin/problems')}
                />
            ) : (
                <></>
            )}

            {hasPermission(userPermissions, UserRoles.USER_MAINTAINER) ? (
                <NavLink
                    label={<Text size='lg'>Users</Text>}
                    leftSection={<FaUsers />}
                    rightSection={<FaChevronRight />}
                    onClick={() => router.push('/admin/problems')}
                    active={pathname.startsWith('/admin/users')}
                />
            ) : (
                <></>
            )}

            {hasPermission(userPermissions, UserRoles.USER_MAINTAINER) ? (
                <NavLink
                    label={<Text size='lg'>Judges</Text>}
                    leftSection={<FaGavel />}
                    rightSection={<FaChevronRight />}
                    onClick={() => router.push('/admin/judges')}
                    active={pathname.startsWith('/admin/judges')}
                />
            ) : (
                <></>
            )}
        </>
    );
}
