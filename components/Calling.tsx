import React from "react";
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'

const Calling = () => {
    return (
        <View>
            <ImageBackground source={require('../images/calling.jpg')} style={{ width: '100%', height: '100%' }}>
                <View style={styles.button}>
                    <TouchableOpacity onPress={() => { }}>
                        <View style={{ backgroundColor: 'green', borderRadius: 30, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name='phone-alt' size={25} color={'white'} ></Icon>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { }}>
                        <View style={{ backgroundColor: 'red', borderRadius: 30, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name='phone-slash' size={25} color={'white'} ></Icon>
                        </View>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
    )
}
export default Calling

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 70,
        position: 'relative',
        top: Dimensions.get('screen').height - 200

    }
})