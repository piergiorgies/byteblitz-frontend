'use client';

import { User } from "@/models/User";
import api from "@/utils/ky";
import { Box, Container, Flex, Grid, Title, Text } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import Avatar, { AvatarFullConfig, genConfig } from 'react-nice-avatar'

export default function ProfilePage() {
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [avatarConfig, setAvatarConfig] = useState<Required<AvatarFullConfig> | null>(null);

    const getUserInfo = useCallback(async() => {
        const data = await api.get('users/me');
        const user = await data.json<User>();

        setUserInfo(user);
        setAvatarConfig(genConfig(user.username));
    }, []);

    useEffect(() => {
        getUserInfo();
    }, [getUserInfo])

    return (
        <Container py='md'>
            <Grid grow gutter='xs'>
                <Grid.Col span={4}>
                    <Flex bg='white' p='md' gap='xs' align='center'>
                        <Avatar {...avatarConfig} style={{ width: '3rem', height: '3rem' }} />
                        <Box>
                            <Title order={3}>{userInfo?.username}</Title>
                            <Text c='blue' size='sm' fw='bold'>42 solves</Text>
                        </Box>
                    </Flex>
                </Grid.Col>
                <Grid.Col span={8}>
                    
                </Grid.Col>
            </Grid>
        </Container>
    )
}