// JALNETRA AI — WhatsApp & SMS Farmer Advisory Alert Edge Function
// Sends real WhatsApp/SMS messages via Twilio.
// Falls back to simulated success if secrets are not configured.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AdvisoryRequest {
  number: string;
  name: string;
  village: string;
  crop: string;
  language?: string;
  channel?: "whatsapp" | "sms";
  message?: string;
}

function buildAlertMessage(name: string, village: string, crop: string): string {
  return `JALNETRA AI: Hi ${name}, your ${crop} field in ${village} needs irrigation. Reply YES for schedule.`;
}

function normalizeNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const ten = digits.length >= 10 ? digits.slice(-10) : digits;
  return `+91${ten}`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: AdvisoryRequest = await req.json();
    const channel = body.channel || "whatsapp";

    if (!body.number) {
      return new Response(
        JSON.stringify({ error: "Missing phone number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const alertMessage = body.message || buildAlertMessage(
      body.name || "Farmer",
      body.village || "Unknown",
      body.crop || "Unknown"
    );

    // Read Twilio secrets
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioWhatsappNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");
    const twilioSmsNumber = Deno.env.get("TWILIO_SMS_NUMBER");

    // Debug log — shows which secrets are loaded
    console.log("ENV CHECK:", {
      SID: twilioSid ? "OK" : "MISSING",
      TOKEN: twilioToken ? "OK" : "MISSING",
      WHATSAPP: twilioWhatsappNumber ? "OK" : "MISSING",
      SMS: twilioSmsNumber ? "OK" : "MISSING",
      CHANNEL: channel,
    });

    // Demo mode — if any secret is missing, return simulated success
    if (!twilioSid || !twilioToken || !twilioWhatsappNumber || !twilioSmsNumber) {
      console.log("Demo mode: One or more Twilio secrets are missing.");
      return new Response(
        JSON.stringify({
          success: true,
          simulated: true,
          channel,
          message: "Demo mode: Twilio not configured. Message preview shown.",
          preview: alertMessage,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build To and From numbers based on channel
    const normalized = normalizeNumber(body.number);
    const toNumber = channel === "whatsapp" ? `whatsapp:${normalized}` : normalized;
    const fromNumber = channel === "whatsapp" ? `whatsapp:${twilioWhatsappNumber}` : twilioSmsNumber;

    console.log("Sending via Twilio:", { channel, to: toNumber, from: fromNumber });

    // Call Twilio REST API
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const params = new URLSearchParams();
    params.append("From", fromNumber);
    params.append("To", toNumber);
    params.append("Body", alertMessage);

    const auth = btoa(`${twilioSid}:${twilioToken}`);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.log("Twilio error:", errText);
      return new Response(
        JSON.stringify({ error: `Twilio error: ${errText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Twilio success:", { sid: data.sid, status: data.status });

    return new Response(
      JSON.stringify({
        success: true,
        simulated: false,
        channel,
        sid: data.sid,
        status: data.status,
        to: toNumber,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.log("Unexpected error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
