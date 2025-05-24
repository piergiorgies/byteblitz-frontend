import { ActionIcon, Tooltip, useMantineColorScheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { FaDesktop, FaMoon, FaSun } from "react-icons/fa6";

const COLOR_SCHEMES = ['light', 'dark', 'auto'] as const;
type ColorSchemeType = (typeof COLOR_SCHEMES)[number];

export default function ColorSchemeChanger() {
    const { colorScheme, setColorScheme, clearColorScheme } =
        useMantineColorScheme();
    const [localScheme, setLocalScheme] = useState<ColorSchemeType>('auto');

    useEffect(() => {
        const storedScheme = localStorage.getItem(
            'mantine-color-scheme',
        ) as ColorSchemeType | null;
        if (storedScheme && COLOR_SCHEMES.includes(storedScheme)) {
            setLocalScheme(storedScheme);
            if (storedScheme === 'auto') {
                clearColorScheme();
            } else {
                setColorScheme(storedScheme);
            }
        }
    }, [clearColorScheme, setColorScheme]);

    const cycleColorScheme = () => {
        const currentIndex = COLOR_SCHEMES.indexOf(localScheme);
        const nextIndex = (currentIndex + 1) % COLOR_SCHEMES.length;
        const nextScheme = COLOR_SCHEMES[nextIndex];
        setLocalScheme(nextScheme);

        if (nextScheme === 'auto') {
            clearColorScheme();
            localStorage.removeItem('mantine-color-scheme');
        } else {
            setColorScheme(nextScheme);
            localStorage.setItem('mantine-color-scheme', nextScheme);
        }
    };

    const getIcon = () => {
        switch (localScheme) {
            case 'light':
                return <FaSun size={20} />;
            case 'dark':
                return <FaMoon size={20} />;
            case 'auto':
            default:
                return <FaDesktop size={20} />;
        }
    };

    const getTooltip = () => {
        switch (localScheme) {
            case 'light':
                return 'Light mode';
            case 'dark':
                return 'Dark mode';
            case 'auto':
            default:
                return 'Auto (system)';
        }
    };

    useEffect(() => {
        const html = document.documentElement;
        if (colorScheme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    }, [colorScheme]);

    return (
        <Tooltip label={getTooltip()} position='bottom' withArrow>
            <ActionIcon
                variant='subtle'
                onClick={cycleColorScheme}
                size='lg'
                radius='xl'
            >
                {getIcon()}
            </ActionIcon>
        </Tooltip>
    );
};
