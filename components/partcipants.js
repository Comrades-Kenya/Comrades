import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, ScrollView, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Icon } from 'react-native-elements';

const ParticipantsScreen = ({ route, navigation }) => {
    const [selectedEventId, setSelectedEventId] = useState(null);
    const { event } = route.params;
    const [participants, SetParticipants] = useState([]);
    const [searchText, setSearchText] = useState('');

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

    const handleSearchChange = async(text) => {
        setSearchText(text);
        if (text === '') {
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
                const data = response.data;

                SetParticipants(data);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle error appropriately, e.g., show a message to the user
            }
        }
      };

    const handleSearch = async () => {
        SetParticipants([]);
        if (searchText.length >= 1) {

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
                const data = response.data;

                
                const filteredData = data.filter(participant => (
                    (participant.firstname.toLowerCase() + " " + participant.lastname.toLowerCase()).includes(searchText.toLowerCase())
                ));
                
                
                SetParticipants(filteredData);

                if (filteredData.length == 0) {
                    alert('No search results were found');
                    SetParticipants(data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle error appropriately, e.g., show a message to the user
            }
        }
        else {
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
                const data = response.data;

                SetParticipants(data);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle error appropriately, e.g., show a message to the user
            }
        }
    };


    return (
        <ScrollView style={styles.container}>
            {participants.length == 0 ? (
                <ActivityIndicator style={{ marginTop: 50 }} size="large" color="green" />
            ) : (
                <>
                    <View style={styles.searchwrapper}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search..."
                            value={searchText}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                        <TouchableOpacity onPress={handleSearch}>
                            <Icon
                                name="search"
                                type="font-awesome"
                                size={25}
                                color="green"
                                containerStyle={{ marginLeft: 10 }}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.title}>{event.description} Participants</Text>
                    {participants.map((participant) => (
                        <View style={styles.userInfo} key={participant.firstname+participant.lastname}>
                            <Image source={{ uri: 'https://i.pinimg.com/736x/64/81/22/6481225432795d8cdf48f0f85800cf66.jpg' }} style={styles.userImage} />
                            <View>
                                <Text style={styles.userName}>{participant.firstname} {participant.lastname}</Text>
                                <Text style={styles.userEmail}>{participant.email}</Text>
                            </View>
                        </View>
                    ))}
                </>
            )}
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
    searchwrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderColor: 'orange',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        marginRight: 10,
    },
};

export default ParticipantsScreen;