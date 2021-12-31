// import React from "react";
// import { Button, Dimensions, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
// import io, { connect } from 'socket.io-client'
// import Icon from 'react-native-vector-icons/FontAwesome5';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import MainScreen from "./screens/main";
// import Call from "./screens/Call";
// import 'react-native-gesture-handler';

// const Stack = createStackNavigator();

// const App = () => {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         <Stack.Screen name="main" component={MainScreen} />
//         <Stack.Screen name="Call" component={Call} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   )
// }
// export default App;

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
  const [id, setID] = useState([])
  const [callID, setCallID] = useState('')
  const [isFront, setIsFront] = useState(true)

  useEffect(() => {
    //connect to sever and create a peer
    socket.current = io("http://192.168.0.102:3000")
    setUp()
  }, [])

  // useEffect(() => {
  //   mediaDevices.enumerateDevices().then(sourceInfos => {
  //     console.log(sourceInfos);
  //     let videoSourceId;
  //     for (let i = 0; i < sourceInfos.length; i++) {
  //       const sourceInfo = sourceInfos[i];
  //       if (sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "environment")) {
  //         videoSourceId = sourceInfo.deviceId;
  //       }
  //     }
  //     mediaDevices.getUserMedia({
  //       audio: true,
  //       video:
  //       {
  //         mandatory: {
  //           minWidth: 640,
  //           minHeight: 480,
  //           minFrameRate: 30,
  //         },
  //         facingMode: (isFront ? "user" : "environment"),
  //         optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
  //       }
  //     })
  //       .then((stream: any) => {
  //         localStream.getTracks().forEach((track: any) => track.stop());
  //         setLocalStream(stream);
  //         // localStream.getVideoTracks().forEach((track: any) => track._switchCamera());

  //         pc.current?.addStream(stream)
  //         // stream.getVideoTracks().forEach((track: any) => track._switchCamera());
  //       })
  //       .catch(error => {
  //         console.log(error)
  //       });
  //   });
  //   // switchCamera()
  //   // Add stream
  //   // pc.current!.onaddstream = (event: EventOnAddStream) => {
  //   //   setRemoteStream(event.stream)
  //   // }
  // }, [isFront])

  const setUp = () => {

    pc.current = new RTCPeerConnection(configuration)

    socket.current.on('id', (id: any) => {
      let otherContacts = id.filter((contact: any) => contact != socket.current.id);
      setID(otherContacts)
    })

    //get local stream
    // let isFront = true;
    mediaDevices.enumerateDevices().then(sourceInfos => {
      console.log(sourceInfos);
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
    //Add stream
    pc.current.onaddstream = (event: EventOnAddStream) => {
      setRemoteStream(event.stream)
    }

    //Listen event hearing candidate
    socket.current.on('candidate1', (icecandidate: any) => {
      const candidate = new RTCIceCandidate(icecandidate)
      pc.current?.addIceCandidate(candidate)
    })
    //Listen event endcall
    socket.current.on('endcall1', (note: any) => {
      endCall()
    })
    //Listen event send offer and answer
    socket.current.on('calling', async (data: any) => {
      if (data.desc.type == 'offer') {
        await pc.current?.setRemoteDescription(new RTCSessionDescription(data.desc))
        await setCalling(true)
        setCallID(data.ID)
      }
      if (data.desc.type == 'answer') {
        await pc.current?.setRemoteDescription(new RTCSessionDescription(data.desc))
      }
    })
  }

  const switchCamera = () => {
    localStream.getVideoTracks().forEach((track: any) => track._switchCamera());
  }

  const Mute = () => {
    localStream.getTracks().forEach((track: any) => {
      if (track.kind === 'audio') track.enabled = !track.enabled

    })
  }

  const remoteCamera = () => {
    localStream.getTracks().forEach((track: any) => {
      if (track.kind === 'video') track.enabled = !track.enabled

    })
  }

  const switchSpeaker = () => {
    localStream.getAudioTracks()[0].enableSpeakerphone(true);
  }


  //make a call
  const makeCall = async (item: string) => {
    setInCall(true)
    console.log('ID', callID)
    pc.current?.createOffer().then(desc => {
      console.log('set local desc')
      pc.current?.setLocalDescription(desc).then(() => {
        console.log('gui offer')
        socket.current.emit('OfferAnswer', {
          localID: socket.current.id,
          remoteID: item,
          desc: pc.current?.localDescription
        })
      });
      setCallID(item)
    });
    pc.current!.onicecandidate = (event: EventOnCandidate) => {
      socket.current.emit('candidate', { remoteID: callID, ice: event.candidate })
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
            socket.current.emit('OfferAnswer', {
              remoteID: callID,
              desc: pc.current?.localDescription
            })
          })
      })
    pc.current!.onicecandidate = (event: EventOnCandidate) => {
      socket.current.emit('candidate', { remoteID: callID, ice: event.candidate })
      console.log('candidate', event.candidate)
    }
  }

  const endCall = () => {
    setInCall(false)
    setRemoteStream(null)
    setLocalStream(null)
    pc.current?.close()
    setUp()
    setCallID('')
    setIsFront(true)
  }
  if (calling) {
    return (
      <View>
        <ImageBackground source={require('./images/calling.jpg')} style={{ width: '100%', height: '100%' }}>
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
          <FlatList
            data={id}
            renderItem={({ item }) => (
              <View>
                <TouchableOpacity onPress={() => {
                  makeCall(item)
                }}>
                  <Text>{item}</Text>
                </TouchableOpacity>
              </View>
            )}
          ></FlatList>
        </View>
      )
    }
    if (inCall == true && localStream && remoteStream == null) {
      return (
        <View>
          <RTCView streamURL={localStream.toURL()} style={styles.rtcRemote} mirror objectFit='cover' ></RTCView>
          <View style={styles.btnstyle}>
            <TouchableOpacity onPress={() => { setInCall(false), setRemoteStream(null), setCallID('') }}>
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
              endCall()
              socket.current.emit('endcall', callID)
            }}>
              <View style={{ backgroundColor: 'red', borderRadius: 30, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name='phone-slash' size={25} color={'white'} ></Icon>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              // setIsFront(!isFront)
              switchSpeaker()
            }}>
              <View style={{ borderRadius: 30, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name='exchange-alt' size={25} color={'white'} ></Icon>
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
    height: '30%',
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