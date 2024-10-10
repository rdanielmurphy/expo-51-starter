import React, { useEffect, useState } from 'react'
import { Linking, View } from 'react-native';
import { Button, Paragraph } from 'react-native-paper';
import { SQL_GET_ERROR_LOG } from '../../lib/sqlCommands';
import { useDbContext } from '../../contexts/DbContext';

export const SendErrorLog = (navigation: any) => {
    const [log, setLog] = useState<string>("");
    const { getAllAsync } = useDbContext();

    useEffect(() => {
        const fetchLog = async () => {
            const res = await getAllAsync(SQL_GET_ERROR_LOG());
            if (res && res.length > 0) {
                setLog(JSON.stringify(res.map((r: any) => (
                    {
                        screen: r.screen,
                        area: r.area,
                        error: r.error,
                        stack: r.stack
                    }
                ))[0]))
            }
        }

        fetchLog();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 25 }}>
            <Paragraph>Click button below to send an email with the error log for help in diagnosis</Paragraph>
            <Button
                disabled={log.length === 0}
                onPress={() => Linking.openURL(`mailto:rdanielmurphy@gmail.com?subject=Errorlog&body=${log}`)}>
                Send log in email
            </Button>
        </View >
    )
}