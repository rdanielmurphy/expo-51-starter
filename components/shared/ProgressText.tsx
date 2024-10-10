import React, { useState, useEffect, ReactNode } from 'react';
import { View } from 'react-native';
import { Headline } from 'react-native-paper';

const LoadingText = ({ children = 'Loading' }: { children: ReactNode }) => {
    const [loadingText, setLoadingText] = useState(' .');

    useEffect(() => {
        const intervalId = setInterval(() => {
            setLoadingText((prevLoadingText) => {
                switch (prevLoadingText) {
                    case ' .':
                        return ' ..';
                    case ' ..':
                        return ' ...';
                    case ' ...':
                        return ' .';
                    default:
                        return ' .';
                }
            });
        }, 500);

        return () => clearInterval(intervalId); // Clear interval on unmount
    }, []);

    return (
        <View style={{ display: 'flex', flexDirection: 'row' }}>
            <Headline style={{ fontStyle: 'italic' }}>{children}</Headline>
            <Headline style={{ fontStyle: 'italic' }}>{loadingText}</Headline>
        </View>
    );
};

export default LoadingText;