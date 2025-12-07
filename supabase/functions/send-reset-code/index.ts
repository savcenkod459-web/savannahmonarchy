import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendResetCodeRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendResetCodeRequest = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists (optimized query)
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
      perPage: 1000
    });
    
    if (userError) {
      console.error("Error fetching users:", userError);
      throw userError;
    }

    const userExists = userData.users.some(u => u.email === email);

    if (!userExists) {
      // Возвращаем ошибку что пользователь не найден
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "user_not_found",
          message: "User with this email does not exist" 
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code in database (expires in 15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    // Insert new code (no rate limiting for faster delivery)
    const { error: insertError } = await supabase
      .from("password_reset_codes")
      .insert({
        user_email: email,
        code: code,
        expires_at: expiresAt,
        used: false,
      });

    if (insertError) {
      console.error("Error inserting reset code:", insertError);
      throw insertError;
    }

    // Send email with the reset code immediately with high priority
    const emailResponse = await resend.emails.send({
      from: "SavannahMonarchy <noreply@savannahmonarchy.com>",
      to: [email],
      subject: `🔐 ${code} - Your Password Reset Code`,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high",
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #D9B370; text-align: center; margin-bottom: 20px;">🐾 SavannahMonarchy</h1>
            <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Password Reset Code</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Hello!
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
              You have requested a password reset for your account. Use the code below to confirm:
            </p>
            
            <div style="background: linear-gradient(135deg, #FFF8E7 0%, #FFE4B5 100%); border: 3px solid #D9B370; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0; box-shadow: 0 4px 15px rgba(217, 179, 112, 0.2);">
              <div style="color: #8B7355; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</div>
              <div style="font-size: 36px; font-weight: bold; color: #D9B370; letter-spacing: 10px; font-family: 'Courier New', monospace; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
                ${code}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5; margin-top: 30px;">
              ⏱️ This code is valid for <strong>15 minutes</strong>.
            </p>
            
            <p style="color: #999; font-size: 12px; line-height: 1.5; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              If you did not request a password reset, please ignore this email. Your account is safe.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #D9B370; font-size: 12px; margin: 0;">SavannahMonarchy - Elite Savannah Cats</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Code sent to your email"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-reset-code function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred while sending the code" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
