import React from "react";
import { View } from "react-native";

const Call = () => {
    return (
        <View></View>
    )
    // if (calling) {
    //     return (
    //         <View>
    //             <ImageBackground source={require('../images/calling.jpg')} style={{ width: '100%', height: '100%' }}>
    //                 <View style={styles.button}>
    //                     <TouchableOpacity onPress={() => {
    //                         setCalling(false)
    //                         setInCall(true)
    //                         Answer()
    //                     }}>
    //                         <View style={{ backgroundColor: 'green', borderRadius: 30, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
    //                             <Icon name='phone-alt' size={25} color={'white'} ></Icon>
    //                         </View>
    //                     </TouchableOpacity>
    //                     <TouchableOpacity onPress={() => {
    //                         setCalling(false)
    //                         setInCall(false)
    //                     }}>
    //                         <View style={{ backgroundColor: 'red', borderRadius: 30, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
    //                             <Icon name='phone-slash' size={25} color={'white'} ></Icon>
    //                         </View>
    //                     </TouchableOpacity>
    //                 </View>
    //             </ImageBackground>
    //         </View>
    //     )
    // }
    // else {
    //     if (inCall == false) {
    //         return (
    //             <View>
    //                 <Button title="Call" onPress={() => {
    //                     makeCall()
    //                 }}></Button>
    //             </View>
    //         )
    //     }
    //     if (inCall == true && localStream && remoteStream == null) {
    //         return (
    //             <View>
    //                 <RTCView streamURL={localStream.toURL()} style={styles.rtcRemote} mirror objectFit='cover' ></RTCView>
    //                 <View style={styles.btnstyle}>
    //                     <TouchableOpacity onPress={() => { setInCall(false), setRemoteStream(null) }}>
    //                         <View style={{ backgroundColor: 'red', borderRadius: 30, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
    //                             <Icon name='phone-slash' size={25} color={'white'} ></Icon>
    //                         </View>
    //                     </TouchableOpacity>
    //                 </View>
    //             </View>
    //         )
    //     }
    //     if (inCall == true && localStream && remoteStream) {
    //         return (
    //             <View>
    //                 <RTCView streamURL={remoteStream.toURL()} style={styles.rtcRemote} mirror objectFit='cover' ></RTCView>
    //                 <RTCView streamURL={localStream.toURL()} style={styles.rtcLocal} mirror objectFit='contain' ></RTCView>

    //                 <View style={styles.btnstyle}>
    //                     <TouchableOpacity onPress={() => {
    //                         setInCall(false)
    //                         setRemoteStream(null)
    //                         endCall()
    //                     }}>
    //                         <View style={{ backgroundColor: 'red', borderRadius: 30, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
    //                             <Icon name='phone-slash' size={25} color={'white'} ></Icon>
    //                         </View>
    //                     </TouchableOpacity>

    //                 </View>
    //             </View>
    //         )
    //     }
    // }
}
export default Call