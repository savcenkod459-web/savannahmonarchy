import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: VerificationRequest = await req.json();

    console.log(`Sending verification code to ${email}`);

    // Send email via Resend - English only with proper sender name
    const emailResponse = await resend.emails.send({
      from: "SavannahMonarchy <noreply@savannahmonarchy.com>",
      to: [email],
      subject: `🔐 ${code} - Your Email Verification Code`,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high",
      },
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #0a0a0a;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; padding: 30px 0;">
              <h1 style="color: #D4AF37; font-size: 32px; margin: 0; font-weight: 700; letter-spacing: 2px; text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);">
                SavannahMonarchy
              </h1>
              <p style="color: #808080; font-size: 14px; margin-top: 8px; letter-spacing: 1px;">ELITE SAVANNAH CATS</p>
            </div>
            
            <!-- Main Content Card -->
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; padding: 40px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);">
              <h2 style="color: #ffffff; margin: 0 0 10px 0; font-size: 24px; font-weight: 600; text-align: center;">
                Verify Your Email
              </h2>
              <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; text-align: center;">
                Thank you for registering! Please use the verification code below to confirm your email address.
              </p>
              
              <!-- Verification Code Box -->
              <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%); padding: 30px; text-align: center; border-radius: 12px; margin: 30px 0; border: 2px solid rgba(212, 175, 55, 0.4);">
                <p style="color: #a0a0a0; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 2px;">
                  Your Verification Code
                </p>
                <div style="font-size: 48px; font-weight: 700; letter-spacing: 16px; color: #D4AF37; text-shadow: 0 4px 12px rgba(212, 175, 55, 0.4); font-family: 'Courier New', monospace;">
                  ${code}
                </div>
              </div>
              
              <!-- Timer Notice -->
              <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px 20px; margin: 20px 0;">
                <p style="color: #808080; font-size: 14px; margin: 0; text-align: center;">
                  ⏱️ This code will expire in <strong style="color: #D4AF37;">10 minutes</strong>
                </p>
              </div>
              
              <!-- Security Notice -->
              <p style="color: #666666; font-size: 13px; margin: 25px 0 0 0; text-align: center; line-height: 1.5;">
                If you did not create an account with SavannahMonarchy, please ignore this email.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 30px 0;">
              <p style="color: #505050; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} SavannahMonarchy. All rights reserved.
              </p>
              <p style="color: #404040; font-size: 11px; margin-top: 10px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Verification code sent to your email"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-verification-code:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
