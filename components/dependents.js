import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Dependents = ({ navigation }) => {
    const [dependents, setDependents] = useState([]);

    useEffect(() => {
        getBioData();
    }, []);

    const getBioData = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const comradeid = await AsyncStorage.getItem('comradeid');
            try {
                const apiUrl = 'https://portal.comradeskenya.com/api/api/event/biodata';
                const params = {
                    token: userToken,
                    comradeid: comradeid
                };
                const response = await axios.get(apiUrl, { params });
                setDependents(response.data[0].dependents);
                console.log(response.data[0].dependents);
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

    return (
        <View style={styles.container}>
            {dependents.length === 0 ? (
                <ActivityIndicator style={{ marginTop: 50 }} size="large" color="green" />
            ) : (
                dependents.map((dependent) => (
                    <View style={styles.userInfo} key={dependent.dependent_id}>
                        <Image source={{ uri: 'https://i.pinimg.com/736x/64/81/22/6481225432795d8cdf48f0f85800cf66.jpg' }} style={styles.userImage} />
                        <View>
                            <Text style={styles.userName}>{dependent.name}</Text>
                            <Text style={styles.userEmail}>{dependent.relationship}</Text>
                        </View>
                    </View>
                ))
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 6
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
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
});

export default Dependents;
