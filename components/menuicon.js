// FloatingButton.js
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome';


const MenuIcon = () => {
    const navigation = useNavigation();

    const handlePress = () => {
        navigation.navigate('Menu');
    };

    return (
        <Icon
            name="bars"
            size={25}
            style={{ paddingRight: 10 }}
            onPress={handlePress}
            color="black"
        />
    );
};

export default MenuIcon;
