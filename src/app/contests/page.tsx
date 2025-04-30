'use client';

import {
    Box,
    Center,
    Tabs,
    Text,
    Loader,
    Container,
    Grid,
    Title,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import api from '@/utils/ky';
import ContestCard from '@/components/contests/ContestCard';
import { ContestMinimal } from '@/models/Contest';

export default function Contests() {
    const [contests, setContests] = useState<{
        ongoing: ContestMinimal[];
        upcoming: ContestMinimal[];
        past: ContestMinimal[];
    }>({
        ongoing: [],
        upcoming: [],
        past: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await api.get('contests/info');
                response
                    .json<{
                        ongoing: ContestMinimal[];
                        upcoming: ContestMinimal[];
                        past: ContestMinimal[];
                    }>()
                    .then((data) => {
                        setContests(data);
                        setLoading(false);
                    });
            } catch (error) {
                console.error('Error fetching contests:', error);
                setLoading(false);
            }
        };

        fetchContests();
    }, []);

    return (
        <Box p='xl'>
            {loading ? (
                <Center mt='xl'>
                    <Loader size='lg' />
                </Center>
            ) : (
                <Grid gutter='xl'>
                    {/* Past Contests */}
                    <Grid.Col span={4}>
                        <Center>
                            <Title order={2}>Past Contests</Title>
                        </Center>
                        {contests.past.map((contest) => (
                            <ContestList
                                key={contest.id}
                                contests={[contest]}
                            />
                        ))}
                    </Grid.Col>

                    {/* Ongoing Contests */}
                    <Grid.Col span={4}>
                        <Center>
                            <Title order={2}>Ongoing Contests</Title>
                        </Center>
                        {contests.ongoing.map((contest) => (
                            <ContestList
                                key={contest.id}
                                contests={[contest]}
                            />
                        ))}
                    </Grid.Col>

                    {/* Upcoming Contests */}
                    <Grid.Col span={4}>
                        <Center>
                            <Title order={2}>Upcoming Contests</Title>
                        </Center>
                        {contests.upcoming.map((contest) => (
                            <ContestList
                                key={contest.id}
                                contests={[contest]}
                            />
                        ))}
                    </Grid.Col>
                </Grid>
            )}
        </Box>
    );
}

function ContestList({ contests }: { contests: ContestMinimal[] }) {
    if (contests.length === 0) {
        return <Text mt='md'>No contests available</Text>;
    }

    return (
        <Box mt='md'>
            {contests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} />
            ))}
        </Box>
    );
}
