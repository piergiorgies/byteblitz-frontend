'use client';

import { Breadcrumbs, Text } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { FaChevronRight } from 'react-icons/fa6';

export default function AutoBreadcrumbs({
    path,
    separator,
}: {
    path?: string;
    separator?: ReactNode;
}) {
    const realPath = path ? path : usePathname();
    const formattedPath = realPath.startsWith('/')
        ? realPath.slice(1)
        : realPath;
    const pathElements = formattedPath.split('/');
    const items = pathElements.map((item, index) =>
        index === pathElements.length - 1 ? (
            <Text key={index}>{item[0].toUpperCase() + item.slice(1)}</Text>
        ) : (
            <Link
                key={index}
                href={`/${pathElements.slice(0, index).join('/')}${index === 0 ? '' : '/'}${item}`}
            >
                <Text c='dimmed' td='underline'>
                    {item[0].toUpperCase() + item.slice(1)}
                </Text>
            </Link>
        ),
    );

    return (
        <Breadcrumbs
            separator={
                separator == null ? <FaChevronRight size='0.7em' /> : separator
            }
            separatorMargin='xs'
        >
            {items}
        </Breadcrumbs>
    );
}
