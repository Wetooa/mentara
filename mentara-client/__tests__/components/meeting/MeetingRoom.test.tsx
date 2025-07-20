import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/setup'
import userEvent from '@testing-library/user-event'
import { MeetingRoom } from '@/components/meeting/MeetingRoom'
import { useMeetingRoom } from '@/hooks/useMeetingRoom'

// Mock the meeting room hook
jest.mock('@/hooks/useMeetingRoom')
const mockUseMeetingRoom = useMeetingRoom as jest.MockedFunction<typeof useMeetingRoom>

// Mock WebRTC APIs
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn(),
    enumerateDevices: jest.fn(),
  },
  writable: true,
})

global.RTCPeerConnection = jest.fn().mockImplementation(() => ({
  createOffer: jest.fn(),
  createAnswer: jest.fn(),
  setLocalDescription: jest.fn(),
  setRemoteDescription: jest.fn(),
  addIceCandidate: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
}))

describe('MeetingRoom Component', () => {
  const mockMeetingData = {
    id: 'meeting-123',
    therapistId: 'therapist-1',
    clientId: 'client-1',
    scheduledAt: '2024-01-15T10:00:00Z',
    duration: 60,
    status: 'in-progress',
    meetingUrl: 'https://meeting.mentara.com/meeting-123',
  }

  const mockMeetingRoomData = {
    isConnected: true,
    localStream: null,
    remoteStream: null,
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    participants: [
      { id: 'client-1', name: 'John Doe', role: 'client' },
      { id: 'therapist-1', name: 'Dr. Smith', role: 'therapist' },
    ],
    connectionStatus: 'connected' as const,
    error: null,
  }

  const mockActions = {
    joinMeeting: jest.fn(),
    leaveMeeting: jest.fn(),
    toggleMute: jest.fn(),
    toggleVideo: jest.fn(),
    toggleScreenShare: jest.fn(),
    sendMessage: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseMeetingRoom.mockReturnValue({
      ...mockMeetingRoomData,
      ...mockActions,
    })

    // Mock getUserMedia to return a mock stream
    ;(navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue({
      getTracks: () => [],
      getVideoTracks: () => [],
      getAudioTracks: () => [],
    })
  })

  it('renders meeting room interface', () => {
    render(<MeetingRoom meetingId="meeting-123" meetingData={mockMeetingData} />)

    expect(screen.getByText(/meeting room/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mute/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /video/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /screen share/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /leave/i })).toBeInTheDocument()
  })

  it('shows connection status', () => {
    render(<MeetingRoom meetingId="meeting-123" meetingData={mockMeetingData} />)

    expect(screen.getByText(/connected/i)).toBeInTheDocument()
  })

  it('displays participants list', () => {
    render(<MeetingRoom meetingId="meeting-123" meetingData={mockMeetingData} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument()
  })

  it('handles mute toggle', async () => {
    const user = userEvent.setup()
    
    render(<MeetingRoom meetingId="meeting-123" meetingData={mockMeetingData} />)

    const muteButton = screen.getByRole('button', { name: /mute/i })
    await user.click(muteButton)

    expect(mockActions.toggleMute).toHaveBeenCalled()
  })

  it('handles video toggle', async () => {
    const user = userEvent.setup()
    
    render(<MeetingRoom meetingId="meeting-123" meetingData={mockMeetingData} />)

    const videoButton = screen.getByRole('button', { name: /video/i })
    await user.click(videoButton)

    expect(mockActions.toggleVideo).toHaveBeenCalled()
  })

  it('handles screen sharing toggle', async () => {
    const user = userEvent.setup()
    
    render(<MeetingRoom meetingId="meeting-123" meetingData={mockMeetingData} />)

    const screenShareButton = screen.getByRole('button', { name: /screen share/i })
    await user.click(screenShareButton)

    expect(mockActions.toggleScreenShare).toHaveBeenCalled()
  })

  it('handles leaving meeting', async () => {
    const user = userEvent.setup()
    
    render(<MeetingRoom meetingId="meeting-123" meetingData={mockMeetingData} />)

    const leaveButton = screen.getByRole('button', { name: /leave/i })
    await user.click(leaveButton)

    expect(mockActions.leaveMeeting).toHaveBeenCalled()
  })

  it('shows muted state correctly', () => {
    mockUseMeetingRoom.mockReturnValue({
      ...mockMeetingRoomData,
      ...mockActions,
      isMuted: true,
    })

    render(<MeetingRoom meetingId="meeting-123" meetingData={mockMeetingData} />)

    expect(screen.getByRole('button', { name: /unmute/i })).toBeInTheDocument()
  })

  it('shows video off state correctly', () => {
    mockUseMeetingRoom.mockReturnValue({
      ...mockMeetingRoomData,
      ...mockActions,
      isVideoOff: true,
    })

    render(<MeetingRoom meetingId="meeting-123" meetingData={mockMeetingData} />)

    expect(screen.getByRole('button', { name: /turn on video/i })).toBeInTheDocument()
  })

  it('shows screen sharing state correctly', () => {
    mockUseMeetingRoom.mockReturnValue({
      ...mockMeetingRoomData,
      ...mockActions,
      isScreenSharing: true,
    })

    render(<MeetingRoom meetingId="meeting-123" meetingData={mockMeetingData} />)

    expect(screen.getByRole('button', { name: /stop sharing/i })).toBeInTheDocument()
  })

  it('handles connection errors', () => {
    mockUseMeetingRoom.mockReturnValue({
      ...mockMeetingRoomData,
      ...mockActions,
      connectionStatus: 'error',
      error: 'Failed to connect to meeting',
    })

    render(<MeetingRoom meetingId="meeting-123" meetingData={mockMeetingData} />)

    expect(screen.getByText(/failed to connect/i)).toBeInTheDocument()
  })

  it('shows connecting state', () => {
    mockUseMeetingRoom.mockReturnValue({
      ...mockMeetingRoomData,
      ...mockActions,
      connectionStatus: 'connecting',
      isConnected: false,
    })

    render(<MeetingRoom meetingId="meeting-123" meetingData={mockMeetingData} />)

    expect(screen.getByText(/connecting/i)).toBeInTheDocument()
  })

  it('handles chat messages', async () => {
    const user = userEvent.setup()
    
    render(<MeetingRoom meetingId="meeting-123" meetingData={mockMeetingData} />)

    const messageInput = screen.getByPlaceholderText(/type a message/i)
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(messageInput, 'Hello, how are you?')
    await user.click(sendButton)

    expect(mockActions.sendMessage).toHaveBeenCalledWith('Hello, how are you?')
  })

  it('shows emergency termination button for therapists', () => {
    const therapistMeetingData = {
      ...mockMeetingData,
      currentUserRole: 'therapist',
    }

    render(<MeetingRoom meetingId="meeting-123" meetingData={therapistMeetingData} />)

    expect(screen.getByRole('button', { name: /emergency end/i })).toBeInTheDocument()
  })

  it('hides emergency termination for clients', () => {
    const clientMeetingData = {
      ...mockMeetingData,
      currentUserRole: 'client',
    }

    render(<MeetingRoom meetingId="meeting-123" meetingData={clientMeetingData} />)

    expect(screen.queryByRole('button', { name: /emergency end/i })).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<MeetingRoom meetingId="meeting-123" meetingData={mockMeetingData} />)

    // Video container should have proper labels
    const videoContainer = screen.getByRole('main')
    expect(videoContainer).toHaveAttribute('aria-label', expect.stringContaining('meeting'))

    // Control buttons should have proper labels
    const muteButton = screen.getByRole('button', { name: /mute/i })
    expect(muteButton).toHaveAttribute('aria-label')
  })
})