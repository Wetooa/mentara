# WebRTC Deployment Guide

This guide covers the setup and deployment of the WebRTC meeting system for Mentara.

## Overview

The WebRTC implementation provides localized video meeting functionality, replacing third-party services like Zoom or Google Meet. The system automatically generates meeting URLs when appointments are booked and provides a seamless video conferencing experience.

## Architecture

- **Signaling**: Socket.IO WebSocket gateways (`/meetings` namespace)
- **Peer Connections**: `simple-peer` library for WebRTC peer-to-peer connections
- **TURN Servers**: Third-party TURN service (Twilio, Xirsys, or custom Coturn)
- **Room Management**: In-memory for small scale (< 50 concurrent meetings)

## Environment Variables

### Backend (mentara-api)

Add the following environment variables to your backend `.env` file:

```env
# Frontend URL (required for generating meeting URLs)
FRONTEND_URL=https://your-domain.com
# Alternative: APP_URL
APP_URL=https://your-domain.com

# TURN Server Configuration
# Option 1: Twilio TURN Servers (Recommended)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_TURN_SERVER_URL=turn:global.turn.twilio.com:3478

# Option 2: Xirsys TURN Servers
XIRSYS_TURN_SERVER_URL=turn:your-xirsys-server.com:3478
XIRSYS_USERNAME=your-xirsys-username
XIRSYS_CREDENTIAL=your-xirsys-credential

# Option 3: Custom TURN Server (Coturn)
TURN_SERVER_URL=turn:your-turn-server.com:3478
TURN_USERNAME=your-turn-username
TURN_PASSWORD=your-turn-password
```

### Frontend (mentara-web)

Add the following environment variables to your frontend `.env.local` or `.env.production`:

```env
# API URL
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api

# Frontend URL
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com

# Optional: Fallback TURN server configuration (if backend is unavailable)
NEXT_PUBLIC_TURN_SERVER_URL=turn:your-turn-server.com:3478
NEXT_PUBLIC_TURN_USERNAME=your-turn-username
NEXT_PUBLIC_TURN_PASSWORD=your-turn-password
```

## TURN Server Setup

### Option 1: Twilio (Recommended)

1. Sign up for a Twilio account at https://www.twilio.com
2. Navigate to the Twilio Console
3. Get your Account SID and Auth Token
4. Twilio provides free TURN servers with your account
5. Use the global TURN server URL: `turn:global.turn.twilio.com:3478`

### Option 2: Xirsys

1. Sign up for Xirsys at https://xirsys.com
2. Create a TURN server instance
3. Get your server URL, username, and credential
4. Configure in environment variables

### Option 3: Self-Hosted Coturn

1. Install Coturn on your server:
   ```bash
   sudo apt-get install coturn
   ```

2. Configure `/etc/turnserver.conf`:
   ```
   listening-port=3478
   realm=your-domain.com
   server-name=your-domain.com
   user=username:password
   ```

3. Start Coturn service:
   ```bash
   sudo systemctl start coturn
   sudo systemctl enable coturn
   ```

## API Endpoints

### Get WebRTC Configuration

**Endpoint**: `GET /api/meetings/webrtc-config`

**Authentication**: Required (JWT token)

**Response**:
```json
{
  "iceServers": [
    {
      "urls": "stun:stun.l.google.com:19302"
    },
    {
      "urls": "turn:global.turn.twilio.com:3478",
      "username": "your-username",
      "credential": "your-credential"
    }
  ],
  "iceCandidatePoolSize": 10
}
```

## Meeting URL Format

Meeting URLs are automatically generated in the format:
```
{FRONTEND_URL}/meeting/{meetingId}
```

Example:
```
https://mentara.com/meeting/abc123-def456-ghi789
```

## WebSocket Events

### Meeting Room Events (`/meetings` namespace)

#### Client → Server

- `join-meeting`: Join a meeting room
- `leave-meeting`: Leave a meeting room
- `toggle-media`: Toggle video/audio/screen sharing
- `participant-ready`: Mark participant as ready
- `chat-message`: Send chat message
- `webrtc-signal`: Send WebRTC signaling data
- `webrtc-offer`: Send WebRTC offer
- `webrtc-answer`: Send WebRTC answer
- `webrtc-ice-candidate`: Send ICE candidate

#### Server → Client

- `meeting-joined`: Confirmation of joining meeting
- `participant-joined`: New participant joined
- `participant-left`: Participant left
- `participant-media-changed`: Participant media status changed
- `participant-ready`: Participant marked as ready
- `meeting-started`: Meeting started
- `meeting-ended`: Meeting ended
- `chat-message`: Chat message received
- `webrtc-signal`: WebRTC signaling data
- `webrtc-offer`: WebRTC offer received
- `webrtc-answer`: WebRTC answer received
- `webrtc-ice-candidate`: ICE candidate received
- `webrtc-error`: WebRTC error occurred

## Scaling Considerations

### Current Implementation (Small Scale)

- **In-memory room management**: Suitable for < 50 concurrent meetings
- **Single server**: All WebSocket connections on one server
- **No Redis**: Room state stored in memory

### Future Scaling (Medium/Large Scale)

For 50+ concurrent meetings or horizontal scaling:

1. **Redis-based room management**: Store meeting room state in Redis
2. **Load balancing**: Use sticky sessions for WebSocket connections
3. **TURN server scaling**: Ensure TURN server can handle load
4. **Monitoring**: Add connection quality metrics and monitoring

## Troubleshooting

### WebRTC Connections Fail

1. **Check TURN server configuration**: Ensure TURN server credentials are correct
2. **Verify firewall rules**: TURN servers need UDP ports 3478 and 49152-65535
3. **Check browser console**: Look for WebRTC errors
4. **Test STUN servers**: Verify STUN servers are accessible

### Meeting URLs Not Generated

1. **Check FRONTEND_URL**: Ensure environment variable is set correctly
2. **Verify meeting creation**: Check backend logs for meeting creation
3. **Check database**: Verify `meetingUrl` field is populated in database

### WebSocket Connection Issues

1. **Check CORS configuration**: Ensure frontend URL is in CORS allowed origins
2. **Verify authentication**: Ensure JWT token is valid
3. **Check network**: Verify WebSocket connections are not blocked by firewall

### Audio/Video Not Working

1. **Check browser permissions**: Ensure camera/microphone permissions are granted
2. **Verify media constraints**: Check browser console for media access errors
3. **Test on different browsers**: Some browsers have different WebRTC support

## Testing

### Local Development

1. Start backend: `cd mentara-api && npm run start:dev`
2. Start frontend: `cd mentara-web && npm run dev`
3. Create a test meeting
4. Join meeting from two different browser windows
5. Verify video/audio works

### Production Testing

1. Test with different network conditions (WiFi, mobile data)
2. Test behind NAT/firewall
3. Test with multiple participants
4. Monitor connection quality

## Security Considerations

1. **Meeting access control**: Only authorized participants can join
2. **JWT tokens**: Meeting room tokens expire after 24 hours
3. **TURN credentials**: Store securely, never commit to repository
4. **HTTPS required**: WebRTC requires secure context (HTTPS)

## Performance Optimization

1. **Adaptive bitrate**: Adjust video quality based on connection
2. **Connection pooling**: Reuse TURN server connections
3. **Caching**: Cache WebRTC configuration
4. **Monitoring**: Track connection quality and failures

## Support

For issues or questions:
1. Check backend logs: `mentara-api/backend.log`
2. Check browser console for WebRTC errors
3. Review WebSocket connection status
4. Verify environment variables are set correctly

