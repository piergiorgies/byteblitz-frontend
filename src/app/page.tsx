'use client';
import { Center, SimpleGrid, Space } from '@mantine/core';

export default function Home() {
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
                <SimpleGrid cols={3} />
            </div>
        </Center>
    );
}
