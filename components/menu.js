import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import Dependents from './dependents';



const Menu = () => {
    const [biodata, SetBioData] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        GetBioData();
    }, []);


    const GetBioData = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const comradeid = await AsyncStorage.getItem('comradeid');
            try {
                // Replace 'your-api-endpoint' with the actual endpoint
                const apiUrl = 'https://portal.comradeskenya.com/api/api/event/biodata';

                // Define parameters (replace with your actual parameter names and values)
                const params = {
                    token: userToken,
                    comradeid: comradeid
                };

                // Make the GET request with parameters using Axios
                const response = await axios.get(apiUrl, { params });
                SetBioData(response.data[0]);
                console.log(biodata);
            } catch (error) {
                await AsyncStorage.removeItem('userToken');
                navigation.replace('Login');
            }
        } catch (error) {
            console.log(error);
            await AsyncStorage.removeItem('userToken');
            navigation.replace('Login');
        }
    }

    const handleLogout = () => {
        try {
            // Clear the user token or any relevant data stored in AsyncStorage
            AsyncStorage.removeItem('userToken');
            AsyncStorage.removeItem('comradeid');
            // Navigate to the login screen or any other screen
            // Make sure you have access to navigation prop
        } catch (error) {
            console.error('Error logging out:', error);
        }
        navigation.replace('Login');
    };

    const gotoBiodata = () => {
        navigation.navigate('Bio Data');
    }

    const gotoDependants = () => {
        navigation.navigate('Dependants');
    }

    return (
        <View style={styles.container}>
            <View style={styles.userInfo}>
                <Image source={{ uri: 'https://i.pinimg.com/736x/64/81/22/6481225432795d8cdf48f0f85800cf66.jpg' }} style={styles.userImage} />
                <View>
                    <Text style={styles.userName}>{biodata.firstname} {biodata.lastname}</Text>
                    <Text style={styles.userEmail}>{biodata.email_address}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={gotoBiodata} style={styles.menuItem}>
                <Text>Bio Data</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={gotoDependants} style={styles.menuItem}>
                <Text>Dependants</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Text>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    userEmail: {
        fontSize: 14,
        color: 'gray',
    },
    menuItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

export default Menu;
