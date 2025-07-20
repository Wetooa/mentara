export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface BaseEmailData {
  to_name: string;
  to_email: string;
}

export abstract class BaseEmailTemplate<T extends BaseEmailData> {
  // Brand colors for Mentara
  protected readonly BRAND_COLORS = {
    primary: '#8B5CF6', // Purple
    secondary: '#EC4899', // Pink
    accent: '#06B6D4', // Cyan
    success: '#10B981', // Green
    warning: '#F59E0B', // Yellow
    error: '#EF4444', // Red
    dark: '#1F2937', // Dark gray
    light: '#F9FAFB', // Light gray
    white: '#FFFFFF',
  };

  abstract generate(data: T): EmailTemplate;

  protected generateBaseHtml(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mentara</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset and base styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: ${this.BRAND_COLORS.dark};
            background-color: ${this.BRAND_COLORS.light};
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: ${this.BRAND_COLORS.white};
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, ${this.BRAND_COLORS.primary} 0%, ${this.BRAND_COLORS.secondary} 100%);
            padding: 40px 30px;
            text-align: center;
            color: ${this.BRAND_COLORS.white};
        }
        
        .logo {
            font-size: 32px;
            font-weight: 800;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        
        .header-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        .header-title {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header-subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: ${this.BRAND_COLORS.dark};
        }
        
        .description {
            font-size: 16px;
            color: #6B7280;
            margin-bottom: 32px;
            line-height: 1.7;
        }
        
        .cta-container {
            text-align: center;
            margin: 32px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, ${this.BRAND_COLORS.primary} 0%, ${this.BRAND_COLORS.secondary} 100%);
            color: ${this.BRAND_COLORS.white};
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }
        
        .footer {
            background-color: ${this.BRAND_COLORS.light};
            padding: 30px;
            text-align: center;
            border-top: 1px solid #E5E7EB;
        }
        
        .footer-text {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 16px;
        }
        
        .social-links {
            margin-bottom: 16px;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 8px;
            color: #6B7280;
            text-decoration: none;
            font-size: 14px;
        }
        
        .unsubscribe {
            font-size: 12px;
            color: #9CA3AF;
        }
        
        /* Mobile responsive */
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0 16px;
                border-radius: 12px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .footer {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        ${content}
        
        <div class="footer">
            <div class="footer-text">
                This email was sent by Mentara, your mental health companion.
            </div>
            <div class="social-links">
                <a href="#" class="social-link">Privacy Policy</a>
                <a href="#" class="social-link">Terms of Service</a>
                <a href="#" class="social-link">Contact Us</a>
            </div>
            <div class="unsubscribe">
                If you no longer wish to receive these emails, you can <a href="#">unsubscribe here</a>.
            </div>
        </div>
    </div>
</body>
</html>`;
  }
}