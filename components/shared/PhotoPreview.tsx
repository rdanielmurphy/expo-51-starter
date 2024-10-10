import * as React from 'react';
import { Image, View, StyleSheet, TouchableHighlight } from 'react-native';
import { Text } from 'react-native-paper';
import { replaceWithCorrectUri } from '../../lib/photos';
import { IPhoto } from '../../redux/reducers/photos';

interface IProps {
    photo: IPhoto
    disabled?: boolean
    onPress: () => void
}

const PhotoPreview = (props: IProps) => {
    const uri = replaceWithCorrectUri(props.photo.uri);
    
    return (
        <TouchableHighlight
            style={styles.image}
            onPress={props.onPress}
            key={props.photo.id}
            disabled={props.disabled}>
            <View>
                <Image
                    key={props.photo.id}
                    source={{ uri: uri }}
                    style={{ height: 150, width: 150 }} />
                {props.photo.comment && props.photo.comment.length > 0 && <Text style={styles.imageOverlay}>{props.photo.comment}</Text>}
            </View>
        </TouchableHighlight>
    )
}

const styles = StyleSheet.create({
    image: {
        padding: 8,
    },
    imageOverlay: {
        flex: 1,
        position: 'absolute',
        left: 0,
        bottom: 0,
        opacity: 0.5,
        backgroundColor: 'white',
        height: 32,
        width: "100%",
    }
});

export default PhotoPreview;