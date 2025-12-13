import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { SITE_CONFIG } from '@/lib/metadata';

// Skip API routes during static export
export const dynamic = 'force-static';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get profile parameters
    const firstName = searchParams.get('firstName') || 'User';
    const lastName = searchParams.get('lastName') || '';
    const role = searchParams.get('role') || 'client';
    const bio = searchParams.get('bio');
    const avatar = searchParams.get('avatar');
    const specializations = searchParams.get('specializations');
    const languages = searchParams.get('languages');
    const experience = searchParams.get('experience');

    const fullName = `${firstName} ${lastName}`.trim();
    const isTherapist = role === 'therapist';

    // Role-specific themes
    const roleThemes = {
      therapist: {
        bg: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #1e3a8a 100%)',
        accent: '#ffffff',
        text: '#ffffff',
        badge: '#dbeafe',
        badgeText: '#1e40af',
        icon: '🩺',
        title: 'Licensed Therapist',
      },
      client: {
        bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
        accent: '#ffffff', 
        text: '#ffffff',
        badge: '#ede9fe',
        badgeText: '#7c3aed',
        icon: '👤',
        title: 'Community Member',
      },
      admin: {
        bg: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
        accent: '#ffffff',
        text: '#ffffff',
        badge: '#fee2e2',
        badgeText: '#dc2626',
        icon: '⚡',
        title: 'Administrator',
      },
      moderator: {
        bg: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
        accent: '#ffffff',
        text: '#ffffff',
        badge: '#d1fae5',
        badgeText: '#059669',
        icon: '🛡️',
        title: 'Moderator',
      },
    };

    const theme = roleThemes[role as keyof typeof roleThemes] || roleThemes.client;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            background: theme.bg,
            position: 'relative',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='40' cy='40' r='2' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Left Section - Profile Info */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '80px 60px',
            }}
          >
            {/* Role Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  background: theme.badge,
                  color: theme.badgeText,
                  padding: '8px 20px',
                  borderRadius: '25px',
                  fontSize: '18px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{theme.icon}</span>
                {theme.title}
              </div>
            </div>

            {/* Name */}
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: theme.text,
                margin: '0 0 20px 0',
                lineHeight: '1.1',
                textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              }}
            >
              {fullName}
            </h1>

            {/* Specializations for therapists */}
            {isTherapist && specializations && (
              <div
                style={{
                  fontSize: '24px',
                  color: theme.text,
                  opacity: 0.9,
                  marginBottom: '15px',
                  fontWeight: '500',
                }}
              >
                🎯 {specializations.split(',').slice(0, 2).join(', ')}
              </div>
            )}

            {/* Experience for therapists */}
            {isTherapist && experience && (
              <div
                style={{
                  fontSize: '20px',
                  color: theme.text,
                  opacity: 0.8,
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                📅 {experience} years of experience
              </div>
            )}

            {/* Languages */}
            {languages && (
              <div
                style={{
                  fontSize: '18px',
                  color: theme.text,
                  opacity: 0.8,
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                🌐 Available in: {languages.split(',').slice(0, 3).join(', ')}
              </div>
            )}

            {/* Bio */}
            {bio && (
              <p
                style={{
                  fontSize: '22px',
                  color: theme.text,
                  opacity: 0.9,
                  margin: 0,
                  lineHeight: '1.4',
                  maxWidth: '500px',
                }}
              >
                {bio.length > 150 ? `${bio.substring(0, 150)}...` : bio}
              </p>
            )}

            {/* Footer */}
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '60px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
              }}
            >
              <div
                style={{
                  color: theme.text,
                  fontSize: '20px',
                  fontWeight: '600',
                  opacity: 0.8,
                }}
              >
                {SITE_CONFIG.name} • Mental Health Platform
              </div>
            </div>
          </div>

          {/* Right Section - Avatar & Visual Elements */}
          <div
            style={{
              width: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Decorative Elements */}
            <div
              style={{
                position: 'absolute',
                top: '100px',
                right: '50px',
                width: '100px',
                height: '100px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '150px',
                right: '100px',
                width: '60px',
                height: '60px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '30px',
              }}
            />

            {/* Avatar */}
            <div
              style={{
                width: '240px',
                height: '240px',
                borderRadius: '120px',
                overflow: 'hidden',
                border: `6px solid ${theme.accent}`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '80px',
                marginBottom: '30px',
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={fullName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <span style={{ color: theme.text, opacity: 0.7 }}>
                  {theme.icon}
                </span>
              )}
            </div>

            {/* Stats for therapists */}
            {isTherapist && (
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '15px 25px',
                    borderRadius: '15px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.text }}>
                    ⭐
                  </div>
                  <div style={{ fontSize: '14px', color: theme.text, opacity: 0.8 }}>
                    Licensed
                  </div>
                </div>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '15px 25px',
                    borderRadius: '15px',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.text }}>
                    🔒
                  </div>
                  <div style={{ fontSize: '14px', color: theme.text, opacity: 0.8 }}>
                    HIPAA
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating profile OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}