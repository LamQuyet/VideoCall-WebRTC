import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Dimensions, FlatList, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import io, { connect } from 'socket.io-client'
import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStream,
    MediaStreamTrack,
    mediaDevices,
    registerGlobals,
    EventOnAddStream,
    EventOnCandidate
} from 'react-native-webrtc';
import Icon from 'react-native-vector-icons/FontAwesome5';

const MainScreen = () => {

    const socket = useRef<any>()
    const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
    const pc = useRef<RTCPeerConnection>();
    const [localStream, setLocalStream] = useState<any>(null)
    const [remoteStream, setRemoteStream] = useState<any>(null)
    const [inCall, setInCall] = useState(false)
    const [calling, setCalling] = useState(false)
    const [id, setID] = useState()

    useEffect(() => {
        socket.current = io("http://192.168.0.102:3000")
        pc.current = new RTCPeerConnection(configuration)

        socket.current.on('id', (id: any) => {
            setID(id)
        })

        let isFront = true;
        mediaDevices.enumerateDevices().then(sourceInfos => {
            // console.log(sourceInfos);
            let videoSourceId;
            for (let i = 0; i < sourceInfos.length; i++) {
                const sourceInfo = sourceInfos[i];
                if (sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "environment")) {
                    videoSourceId = sourceInfo.deviceId;
                }
            }
            mediaDevices.getUserMedia({
                audio: true,
                video:
                {
                    mandatory: {
                        minWidth: 640,
                        minHeight: 480,
                        minFrameRate: 30,
                    },
                    facingMode: (isFront ? "user" : "environment"),
                    optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
                }
            })
                .then((stream: any) => {
                    setLocalStream(stream);
                    pc.current?.addStream(stream)
                })
                .catch(error => {
                    console.log(error)
                });
        });

        pc.current.onaddstream = (event: EventOnAddStream) => {
            setRemoteStream(event.stream)
        }
        //Listen event hearing candidate
        socket.current.on('candidate1', (icecandidate: any) => {
            const candidate = new RTCIceCandidate(icecandidate)
            pc.current?.addIceCandidate(candidate)
        })
        socket.current.on('calling', async (desc: any) => {
            if (desc.type == 'offer') {
                await pc.current?.setRemoteDescription(new RTCSessionDescription(desc))
                await setCalling(true)
            }
            if (desc.type == 'answer') {
                await pc.current?.setRemoteDescription(new RTCSessionDescription(desc))
            }
        })
    }, [])

    //setup
    // const setupRTC = () => {
    //   //Send candidate to peer
    // }
    //make a call
    const makeCall = () => {
        setInCall(true)
        pc.current?.createOffer().then(desc => {
            console.log('set local desc')
            pc.current?.setLocalDescription(desc).then(() => {
                console.log('gui offer')
                socket.current.emit('OfferAnswer', pc.current?.localDescription)
            });
        });
        pc.current!.onicecandidate = (event: EventOnCandidate) => {
            socket.current.emit('candidate', event.candidate)
            console.log('candidate', event.candidate)
        }
    }

    //answer the call
    const Answer = () => {
        pc.current?.createAnswer()
            .then(desc => {
                console.log('set local desc')
                pc.current?.setLocalDescription(desc)
                    .then(() => {
                        console.log('gui answer')
                        socket.current.emit('OfferAnswer', pc.current?.localDescription)
                    })
            })
        pc.current!.onicecandidate = (event: EventOnCandidate) => {
            socket.current.emit('candidate', event.candidate)
            console.log('candidate', event.candidate)
        }
    }

    const endCall = () => {
        // pc.current?.removeStream
        pc.current?.close()
    }
    if (calling) {
        return (
            <View>
                <ImageBackground source={require('../images/calling.jpg')} style={{ width: '100%', height: '100%' }}>
                    <View style={styles.button}>
                        <TouchableOpacity onPress={() => {
                            setCalling(false)
                            setInCall(true)
                            Answer()
                        }}>
                            <View style={{ backgroundColor: 'green', borderRadius: 30, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                <Icon name='phone-alt' size={25} color={'white'} ></Icon>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setCalling(false)
                            setInCall(false)
                        }}>
                            <View style={{ backgroundColor: 'red', borderRadius: 30, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                <Icon name='phone-slash' size={25} color={'white'} ></Icon>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </View>
        )
    }
    else {
        if (inCall == false) {
            return (
                <View>
                    <Button title="Call" onPress={() => {
                        makeCall()
                    }}></Button>
                </View>
            )
        }
        if (inCall == true && localStream && remoteStream == null) {
            return (
                <View>
                    <RTCView streamURL={localStream.toURL()} style={styles.rtcRemote} mirror objectFit='cover' ></RTCView>
                    <View style={styles.btnstyle}>
                        <TouchableOpacity onPress={() => { setInCall(false), setRemoteStream(null) }}>
                            <View style={{ backgroundColor: 'red', borderRadius: 30, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                <Icon name='phone-slash' size={25} color={'white'} ></Icon>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
        if (inCall == true && localStream && remoteStream) {
            return (
                <View>
                    <RTCView streamURL={remoteStream.toURL()} style={styles.rtcRemote} mirror objectFit='cover' ></RTCView>
                    <RTCView streamURL={localStream.toURL()} style={styles.rtcLocal} mirror objectFit='contain' ></RTCView>

                    <View style={styles.btnstyle}>
                        <TouchableOpacity onPress={() => {
                            setInCall(false)
                            setRemoteStream(null)
                            endCall()
                        }}>
                            <View style={{ backgroundColor: 'red', borderRadius: 30, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                <Icon name='phone-slash' size={25} color={'white'} ></Icon>
                            </View>
                        </TouchableOpacity>

                    </View>
                </View>
            )
        }
    }
}
export default MainScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        justifyContent: 'center'
    },
    rtcRemote: {
        width: '100%',
        height: '100%',
    },
    rtcLocal: {
        width: '30%',
        height: '40%',
        position: 'absolute',
        top: 10,
        left: 10
    },
    btnstyle: {
        position: 'absolute',
        bottom: 30,
        left: 200
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 70,
        position: 'relative',
        top: Dimensions.get('screen').height - 200

    }
})