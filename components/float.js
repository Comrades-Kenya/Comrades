// FloatingButton.js
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const FloatingButton = ({ payFor, clearSelected }) => {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('Pay', { events: payFor, clearSelected: clearSelected });
    };

    return (
        <View style={{ position: 'absolute', bottom: 16, right: 16 }}>
            <TouchableOpacity onPress={handlePress}>
                <View
                    style={{
                        backgroundColor: 'red',
                        padding: 15,
                        borderRadius: 30,
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>
                        PAY FOR {payFor.length} EVENTS <FontAwesomeIcon name="angle-right" size={20} color="white" />
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};
export default FloatingButton;
