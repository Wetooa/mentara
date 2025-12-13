import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { SITE_CONFIG } from '@/lib/metadata';

// Skip API routes during static export
export const dynamic = 'force-static';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters
    const title = searchParams.get('title') || SITE_CONFIG.title;
    const description = searchParams.get('description') || SITE_CONFIG.description;
    const type = searchParams.get('type') || 'default';
    const theme = searchParams.get('theme') || 'primary';
    const image = searchParams.get('image');

    // Define theme colors
    const themes = {
      primary: {
        bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        accent: '#ffffff',
        text: '#ffffff',
        secondary: '#f0fdf4',
      },
      community: {
        bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        accent: '#ffffff',
        text: '#ffffff', 
        secondary: '#fef3c7',
      },
      therapist: {
        bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        accent: '#ffffff',
        text: '#ffffff',
        secondary: '#dbeafe',
      },
      client: {
        bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        accent: '#ffffff',
        text: '#ffffff',
        secondary: '#ede9fe',
      },
    };

    const currentTheme = themes[theme as keyof typeof themes] || themes.primary;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: currentTheme.bg,
            padding: '80px',
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
              background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Logo/Icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                background: currentTheme.accent,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                fontWeight: 'bold',
                color: theme === 'primary' ? '#22c55e' : currentTheme.bg.split(' ')[1], // Extract first color from gradient
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              }}
            >
              {type === 'profile' ? '👤' : 
               type === 'community' ? '👥' : 
               type === 'therapist' ? '🩺' : 
               'M'}
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '900px',
            }}
          >
            {/* Title */}
            <h1
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: currentTheme.text,
                margin: '0 0 30px 0',
                lineHeight: '1.1',
                textShadow: '0 4px 8px rgba(0,0,0,0.2)',
              }}
            >
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p
                style={{
                  fontSize: '28px',
                  color: currentTheme.text,
                  margin: 0,
                  opacity: 0.9,
                  lineHeight: '1.4',
                  maxWidth: '800px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {description.length > 120 
                  ? `${description.substring(0, 120)}...` 
                  : description}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
            }}
          >
            <div
              style={{
                color: currentTheme.text,
                fontSize: '24px',
                fontWeight: '600',
                opacity: 0.8,
              }}
            >
              {SITE_CONFIG.name}
            </div>
            <div
              style={{
                width: '40px',
                height: '40px',
                background: currentTheme.accent,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                color: theme === 'primary' ? '#22c55e' : currentTheme.bg.split(' ')[1],
              }}
            >
              ❤️
            </div>
          </div>

          {/* Profile Image (if provided) */}
          {image && (
            <div
              style={{
                position: 'absolute',
                top: '60px',
                right: '60px',
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                overflow: 'hidden',
                border: `4px solid ${currentTheme.accent}`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              <img
                src={image}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}