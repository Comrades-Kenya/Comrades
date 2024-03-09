import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const UserProfile = ({ navigation }) => {
    const [biodata, SetBioData] = useState({});

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
                console.log(response.data[0]);
            } catch (error) {
                console.log(error);
                await AsyncStorage.removeItem('userToken');
                navigation.replace('Login');
            }
        } catch (error) {
            await AsyncStorage.removeItem('userToken');
            navigation.replace('Login');
        }
    }


    return (
        <View style={styles.container}>
            <Text style={styles.label}>Names: {biodata.firstname} {biodata.lastname}</Text>

            <Text style={styles.label}>Occupation: {biodata.Occupation}</Text>

            <Text style={styles.label}>Address: {biodata.county}</Text>

            <Text style={styles.label}>Email: {biodata.email_address}</Text>
            <Text style={styles.text}>Gender: {biodata.gender}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        margin: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
    },
    text: {
        fontSize: 16,
        marginBottom: 16,
    },
});

export default UserProfile;
