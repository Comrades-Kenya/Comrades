import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ParticipantsScreen = ({ route, navigation }) => {
    const [selectedEventId, setSelectedEventId] = useState(null);
    const { event } = route.params;
    const [participants, SetParticipants] = useState([]);

    useEffect(() => {
        getEventParticipants();
    }, []);

    const getEventParticipants = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');

            const apiUrl = 'https://portal.comradeskenya.com/api/api/event/paidfor';

            // Define parameters (replace with your actual parameter names and values)
            const params = {
                token: userToken,
                eventid: event.id
            };

            // Make the GET request with parameters using Axios
            const response = await axios.get(apiUrl, { params });
            const participantsData = response.data;
            if (participantsData.message == undefined) {
                SetParticipants(participantsData);
            }
        } catch (error) {
            navigation.replace('Login');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{event.description} Participants</Text>
            {participants.map((participant) => (
                <View style={styles.userInfo}>
                    <Image source={{ uri: 'https://i.pinimg.com/736x/64/81/22/6481225432795d8cdf48f0f85800cf66.jpg' }} style={styles.userImage} />
                    <View>
                        <Text style={styles.userName}>{participant.firstname} {participant.lastname}</Text>
                        <Text style={styles.userEmail}>{participant.email}</Text>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = {
    container: {
        flex: 1,
        padding: 16,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
        color: 'blue',
        textDecorationLine: 'underline',
    },
    selectedEventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
        color: 'green',
        textDecorationLine: 'underline',
    },
    participantItem: {
        fontSize: 16,
        marginVertical: 4,
    },
    title: {
        alignSelf: 'center',
        marginBottom: 10,
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
};

export default ParticipantsScreen;