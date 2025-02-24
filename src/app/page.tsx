'use client';
import api from '@/utils/ky';
import { Button, Center, SimpleGrid, Space } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    return (
        <Center className='bg-gray-100'>
            <div className='hero bg-base-200 my-6 min-h-screen'>
                <Space h={50} />
                <Center>
                    <div className='hero-content text-center'>
                        <div className='max-w-lg'>
                            <h1 className='text-5xl font-bold'>
                                Welcome to ByteBlitz!
                            </h1>
                            <h4 className='my-4 text-2xl'>
                                A platform for coding competitions.
                            </h4>
                        </div>
                    </div>
                </Center>
                <Space h={50} />
                <div className='flex justify-center'>
                    <Button fullWidth onClick={() => router.push('/contests')}>
                        View Contests
                    </Button>
                </div>
            </div>
        </Center>
    );
}
