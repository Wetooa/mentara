import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { SITE_CONFIG } from '@/lib/metadata';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get community parameters
    const name = searchParams.get('name') || 'Community';
    const description = searchParams.get('description') || 'Join our supportive mental health community';
    const memberCount = searchParams.get('memberCount');
    const image = searchParams.get('image');
    const type = searchParams.get('type') || 'support'; // support, discussion, wellness

    // Community type themes
    const communityThemes = {
      support: {
        bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
        accent: '#ffffff',
        text: '#ffffff',
        badge: '#fef3c7',
        badgeText: '#d97706',
        icon: '🤝',
        label: 'Support Group',
      },
      discussion: {
        bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
        accent: '#ffffff',
        text: '#ffffff', 
        badge: '#ede9fe',
        badgeText: '#7c3aed',
        icon: '💬',
        label: 'Discussion',
      },
      wellness: {
        bg: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
        accent: '#ffffff',
        text: '#ffffff',
        badge: '#d1fae5', 
        badgeText: '#047857',
        icon: '🌱',
        label: 'Wellness',
      },
    };

    const theme = communityThemes[type as keyof typeof communityThemes] || communityThemes.support;

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
              background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='%23ffffff' opacity='0.4'%3E%3Ccircle cx='25' cy='25' r='2'/%3E%3Ccircle cx='75' cy='25' r='2'/%3E%3Ccircle cx='25' cy='75' r='2'/%3E%3Ccircle cx='75' cy='75' r='2'/%3E%3Ccircle cx='50' cy='50' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Floating Elements */}
          <div
            style={{
              position: 'absolute',
              top: '80px',
              left: '100px',
              width: '120px',
              height: '120px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '60px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '200px',
              right: '150px', 
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '40px',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '100px',
              left: '200px',
              width: '100px',
              height: '100px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '20px',
            }}
          />

          {/* Main Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '80px 60px',
              textAlign: 'center',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {/* Community Type Badge */}
            <div
              style={{
                background: theme.badge,
                color: theme.badgeText,
                padding: '12px 30px',
                borderRadius: '30px',
                fontSize: '20px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '30px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              }}
            >
              <span style={{ fontSize: '24px' }}>{theme.icon}</span>
              {theme.label}
            </div>

            {/* Community Name */}
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: theme.text,
                margin: '0 0 30px 0',
                lineHeight: '1.1',
                textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                maxWidth: '900px',
              }}
            >
              {name}
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: '28px',
                color: theme.text,
                opacity: 0.9,
                margin: '0 0 40px 0',
                lineHeight: '1.4',
                maxWidth: '800px',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {description.length > 120 
                ? `${description.substring(0, 120)}...` 
                : description}
            </p>

            {/* Member Count */}
            {memberCount && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  background: 'rgba(255,255,255,0.15)',
                  padding: '20px 40px',
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)',
                  marginBottom: '40px',
                }}
              >
                <span style={{ fontSize: '32px' }}>👥</span>
                <div>
                  <div
                    style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: theme.text,
                      lineHeight: '1',
                    }}
                  >
                    {parseInt(memberCount).toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      color: theme.text,
                      opacity: 0.8,
                    }}
                  >
                    active members
                  </div>
                </div>
              </div>
            )}

            {/* Community Features */}
            <div
              style={{
                display: 'flex',
                gap: '30px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '12px 20px',
                  borderRadius: '15px',
                  backdropFilter: 'blur(5px)',
                }}
              >
                <span style={{ fontSize: '20px' }}>🔒</span>
                <span style={{ fontSize: '16px', color: theme.text, fontWeight: '500' }}>
                  Safe Space
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '12px 20px',
                  borderRadius: '15px',
                  backdropFilter: 'blur(5px)',
                }}
              >
                <span style={{ fontSize: '20px' }}>🩺</span>
                <span style={{ fontSize: '16px', color: theme.text, fontWeight: '500' }}>
                  Expert Moderated
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '12px 20px',
                  borderRadius: '15px',
                  backdropFilter: 'blur(5px)',
                }}
              >
                <span style={{ fontSize: '20px' }}>💝</span>
                <span style={{ fontSize: '16px', color: theme.text, fontWeight: '500' }}>
                  24/7 Support
                </span>
              </div>
            </div>
          </div>

          {/* Community Image */}
          {image && (
            <div
              style={{
                position: 'absolute',
                top: '60px',
                right: '60px',
                width: '150px',
                height: '150px',
                borderRadius: '20px',
                overflow: 'hidden',
                border: `4px solid ${theme.accent}`,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              }}
            >
              <img
                src={image}
                alt={name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
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
                fontSize: '22px',
                fontWeight: '600',
                opacity: 0.8,
              }}
            >
              {SITE_CONFIG.name} • Mental Health Community
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                background: theme.accent,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              ❤️
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating community OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}