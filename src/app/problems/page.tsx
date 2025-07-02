'use client';

import Difficulty from '@/components/problems/Difficulty';
import { Complexity } from '@/models/Difficulty';
import { Problem } from '@/models/Problem';
import api from '@/utils/ky';
import { Card, Container, Flex, ThemeIcon, Title, Text, Divider, TextInput, ActionIcon } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { FaCheck, FaCircleCheck, FaFilter, FaMagnifyingGlass, FaRegCircleCheck, FaSort, FaTrophy } from 'react-icons/fa6';

export default function Problems() {
    const [problemCount, setProblemCount] = useState(0);

    const getProblems = useCallback(async() => {
        try {
            const response = await api.get('problems');
            const { count } = await response.json<{ count: number, problems: Problem[] }>();

            setProblemCount(count);
        } catch(error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        getProblems();
    }, [getProblems]);

    return (
        <Container py='md'>
            <Flex direction='column' align='center' gap='xs' w='100%'>
                <Flex direction='column' align='center' gap='5px'>
                    <ThemeIcon radius='xl' color='orange' size='4em' styles={{ root: { border: '2px solid var(--mantine-color-orange-8)' } }}>
                        <FaTrophy size='2em' />
                    </ThemeIcon>

                    <Text fw='bold'>{problemCount} public problem{problemCount === 1 ? '' : 's'}</Text>
                </Flex>

                <Divider w='100%' />

                <Flex w='100%' gap='xs' align='center'>
                    <TextInput
                        placeholder='Search problems'
                        leftSection={<FaMagnifyingGlass />}
                    />

                    <ActionIcon radius='xl' variant='light' color='dark'>
                        <FaSort/>
                    </ActionIcon>

                    <ActionIcon radius='xl' variant='light' color='dark'>
                        <FaFilter/>
                    </ActionIcon>
                </Flex>
            
            </Flex>
        </Container>
    );
}
