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

    // Отправляем email через Resend
    const fromEmail = Deno.env.get("FROM_EMAIL") || "SavannahDynasty <onboarding@resend.dev>";
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "Код подтверждения email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #D4AF37; font-size: 28px; margin: 0; text-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);">SavannahDynasty</h1>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.05); border: 2px solid rgba(212, 175, 55, 0.2); border-radius: 16px; padding: 30px; backdrop-filter: blur(10px);">
            <h2 style="color: #D4AF37; margin-top: 0; font-size: 24px;">Подтверждение email</h2>
            <p style="color: #e0e0e0; font-size: 16px; line-height: 1.6;">Ваш код подтверждения:</p>
            
            <div style="background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%); padding: 25px; text-align: center; border-radius: 12px; margin: 25px 0; border: 2px solid rgba(212, 175, 55, 0.3);">
              <div style="font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #D4AF37; text-shadow: 0 2px 8px rgba(212, 175, 55, 0.4);">
                ${code}
              </div>
            </div>
            
            <p style="color: #a0a0a0; font-size: 14px; margin: 20px 0 10px 0;">Код действителен в течение 10 минут.</p>
            <p style="color: #a0a0a0; font-size: 14px; margin: 10px 0;">Если вы не запрашивали этот код, просто проигнорируйте это письмо.</p>
          </div>
          
          <div style="text-align: center; padding-top: 20px;">
            <p style="color: #808080; font-size: 12px;">© 2024 SavannahDynasty. Все права защищены.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Код отправлен на вашу почту"
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
