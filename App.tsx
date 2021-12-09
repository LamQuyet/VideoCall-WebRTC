import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
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

const App = () => {

  const socket = io("http://192.168.0.102:3000")
  const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
  const pc = useRef<RTCPeerConnection>();
  const [localStream, setLocalStream] = useState<any>(null)
  const [remoteStream, setRemoteStream] = useState<any>(null)
  const [inCall, setInCall] = useState(false)
  const [calling, setCalling] = useState(false)

  //Setup RTC, Listen event calling and add icecandidate
  useEffect(() => {
    pc.current = new RTCPeerConnection(configuration)
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
    pc.current.onicecandidate = (event: EventOnCandidate) => {
      socket.emit('candidate', event.candidate)
      console.log('candidate', event.candidate)
    }
    // socket.on('calling', (des: any) => {
    //   console.log('Nhan offer hoac answer')
    //   pc.setRemoteDescription(des)
    //   console.log(pc.connectionState)
    // })
    socket.on('candidate1', (icecandidate: any) => {
      const candidate = new RTCIceCandidate(icecandidate)
      pc.current?.addIceCandidate(candidate)
    })
  }, [])

  //make a call
  const makeCall = async () => {
    // pc.current = new RTCPeerConnection(configuration)
    // await setUpRTC()
    pc.current?.createOffer().then(desc => {
      pc.current?.setLocalDescription(desc).then(() => {
        // Send pc.localDescription to peer
        socket.emit('OfferAnswer', pc.current?.localDescription)
      });
    });
    socket.on('calling', async (desc: any) => {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(desc))
      console.log("nhan offer")
    })
  }

  //answer the call
  const Answer = async () => {
    // pc.current = new RTCPeerConnection(configuration)
    // await setUpRTC()
    pc.current?.createAnswer().then(desc => {
      pc.current?.setLocalDescription(desc).then(() => {
        socket.emit('OfferAnswer', pc.current?.localDescription)
      })
    })
    socket.on('calling', async (desc: any) => {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(desc))
      console.log("nhan answer")
    })
  }


  if (inCall == false) {
    return (
      <View>
        <Button title="Call" onPress={() => {
          makeCall()
          setInCall(true)
        }}></Button>
        <Button title="Answer" onPress={() => {
          setInCall(true)
          Answer()
        }}></Button>
      </View>
    )
  }
  if (inCall == true && localStream && remoteStream == null) {
    return (
      <View>
        <RTCView streamURL={localStream.toURL()} style={styles.rtcRemote} mirror objectFit='cover' ></RTCView>
        <View style={styles.btnstyle}>
          <TouchableOpacity onPress={() => { setInCall(false) }}>
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
export default App;

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
  }
})