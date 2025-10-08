import { Container, Flex, Group, Text, useMantineTheme } from "@mantine/core";
import { FaInfo } from "react-icons/fa6";

type ContestDescriptionProps = {
    description?: string;
};

export default function ContestDescription({ description }: ContestDescriptionProps) {
    const theme = useMantineTheme();

    return (
        <Container m={0} p={0}>
            <Group align='center' mb='sm'>
                <Flex align='center' gap='xs' mb='sm'>
                    <FaInfo
                        size={16}
                        style={{
                            color: theme.colors.blue[6],
                            marginTop: 2,
                        }}
                    />
                    <Text fw={600} size='md' c='blue.8'>
                        Contest Description
                    </Text>
                </Flex>
            </Group>
            <Text size='sm'>
                {description || 'No description provided for this contest.'}
            </Text>
        </Container>
    );
}