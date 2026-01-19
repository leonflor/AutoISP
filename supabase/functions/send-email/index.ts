import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  template: string;
  data: Record<string, any>;
  isp_id?: string;
}

// Email templates
const templates: Record<string, (data: Record<string, any>) => { subject: string; html: string }> = {
  welcome: (data) => ({
    subject: `Bem-vindo ao ${data.isp_name || "nosso serviço"}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Bem-vindo, ${data.customer_name}!</h1>
        <p>Obrigado por se cadastrar no ${data.isp_name || "nosso serviço"}.</p>
        <p>Sua conta foi criada com sucesso e você já pode começar a usar nossos serviços.</p>
        <div style="margin: 30px 0; padding: 20px; background: #f3f4f6; border-radius: 8px;">
          <p><strong>Email:</strong> ${data.email}</p>
          ${data.plan_name ? `<p><strong>Plano:</strong> ${data.plan_name}</p>` : ""}
        </div>
        <p>Se precisar de ajuda, entre em contato conosco!</p>
        <p>Atenciosamente,<br>${data.isp_name || "Equipe"}</p>
      </div>
    `
  }),

  "invoice-created": (data) => ({
    subject: `Nova fatura disponível - ${data.isp_name || "Fatura"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Nova Fatura Disponível</h1>
        <p>Olá ${data.customer_name},</p>
        <p>Uma nova fatura foi gerada para você:</p>
        <div style="margin: 30px 0; padding: 20px; background: #f3f4f6; border-radius: 8px;">
          <p><strong>Valor:</strong> R$ ${Number(data.amount).toFixed(2)}</p>
          <p><strong>Vencimento:</strong> ${data.due_date}</p>
          ${data.description ? `<p><strong>Descrição:</strong> ${data.description}</p>` : ""}
        </div>
        ${data.invoice_url ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.invoice_url}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
              Ver Fatura
            </a>
          </div>
        ` : ""}
        ${data.pix_copy_paste ? `
          <div style="margin: 20px 0; padding: 15px; background: #fef3c7; border-radius: 8px;">
            <p><strong>PIX Copia e Cola:</strong></p>
            <code style="word-break: break-all;">${data.pix_copy_paste}</code>
          </div>
        ` : ""}
        <p>Atenciosamente,<br>${data.isp_name || "Equipe"}</p>
      </div>
    `
  }),

  "invoice-overdue": (data) => ({
    subject: `⚠️ Fatura vencida - Ação necessária`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">Fatura Vencida</h1>
        <p>Olá ${data.customer_name},</p>
        <p>Identificamos que sua fatura está vencida:</p>
        <div style="margin: 30px 0; padding: 20px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #dc2626;">
          <p><strong>Valor:</strong> R$ ${Number(data.amount).toFixed(2)}</p>
          <p><strong>Vencimento:</strong> ${data.due_date}</p>
          <p><strong>Dias em atraso:</strong> ${data.days_overdue || "N/A"}</p>
        </div>
        <p>Para evitar a suspensão do seu serviço, regularize seu pagamento o mais rápido possível.</p>
        ${data.invoice_url ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.invoice_url}" style="display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px;">
              Pagar Agora
            </a>
          </div>
        ` : ""}
        <p>Se você já efetuou o pagamento, desconsidere este email.</p>
        <p>Atenciosamente,<br>${data.isp_name || "Equipe"}</p>
      </div>
    `
  }),

  "password-reset": (data) => ({
    subject: `Redefinição de Senha`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Redefinição de Senha</h1>
        <p>Olá ${data.customer_name || ""},</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.reset_url}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
            Redefinir Senha
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Este link expira em ${data.expires_in || "1 hora"}.</p>
        <p style="color: #6b7280; font-size: 14px;">Se você não solicitou esta redefinição, ignore este email.</p>
        <p>Atenciosamente,<br>${data.isp_name || "Equipe"}</p>
      </div>
    `
  }),

  "subscription-activated": (data) => ({
    subject: `🎉 Assinatura Ativada - ${data.plan_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #16a34a;">Assinatura Ativada!</h1>
        <p>Olá ${data.customer_name},</p>
        <p>Sua assinatura foi ativada com sucesso!</p>
        <div style="margin: 30px 0; padding: 20px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #16a34a;">
          <p><strong>Plano:</strong> ${data.plan_name}</p>
          <p><strong>Valor:</strong> R$ ${Number(data.amount).toFixed(2)}/mês</p>
          <p><strong>Próxima cobrança:</strong> ${data.next_billing_date}</p>
        </div>
        <p>Agora você tem acesso a todos os recursos do seu plano!</p>
        <p>Atenciosamente,<br>${data.isp_name || "Equipe"}</p>
      </div>
    `
  }),

  "admin-invite": (data) => ({
    subject: `Você foi convidado como ${data.role_label} - ${data.platform_name || "Sistema de Gestão"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Bem-vindo, ${data.full_name}!</h1>
        <p>Você foi convidado para fazer parte da equipe administrativa como <strong>${data.role_label}</strong>.</p>
        <p>Clique no botão abaixo para definir sua senha e acessar o sistema:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.invite_url}" style="display: inline-block; padding: 14px 28px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Definir Senha e Acessar
          </a>
        </div>
        <div style="margin: 20px 0; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>⚠️ Importante:</strong> Este link expira em 24 horas.
          </p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Se você não esperava este convite, pode ignorar este email.</p>
        <p>Atenciosamente,<br>${data.platform_name || "Equipe de Gestão"}</p>
      </div>
    `
  })
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Check API key
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  
  if (!RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not configured - email feature disabled");
    return new Response(
      JSON.stringify({
        error: "SERVICE_NOT_CONFIGURED",
        message: "Serviço de email não configurado. Configure a secret RESEND_API_KEY no Supabase.",
        docs: "https://resend.com/docs"
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Validate JWT (optional for internal calls)
  const authHeader = req.headers.get("Authorization");
  let userId: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const token = authHeader.replace("Bearer ", "");
      const { data: claims } = await supabaseAuth.auth.getClaims(token);
      userId = claims?.claims?.sub || null;
    } catch {
      // Continue without auth for internal calls
    }
  }

  try {
    const body: EmailRequest = await req.json();
    
    if (!body.to || !body.template || !body.data) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Campos obrigatórios: to, template, data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get template
    const templateFn = templates[body.template];
    if (!templateFn) {
      return new Response(
        JSON.stringify({ 
          error: "Validation error", 
          message: `Template "${body.template}" não encontrado. Disponíveis: ${Object.keys(templates).join(", ")}` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { subject, html } = templateFn(body.data);

    console.log(`📧 Sending email: ${body.template} to ${Array.isArray(body.to) ? body.to.join(", ") : body.to}`);

    // Get ISP info for sender if isp_id provided
    let fromName = "Lovable";
    let fromEmail = "onboarding@resend.dev"; // Default Resend sender

    if (body.isp_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: isp } = await supabase
        .from("isps")
        .select("name, email")
        .eq("id", body.isp_id)
        .single();

      if (isp?.name) {
        fromName = isp.name;
      }
    }

    // Send email via Resend
    const resend = new Resend(RESEND_API_KEY);
    
    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: Array.isArray(body.to) ? body.to : [body.to],
      subject,
      html
    });

    console.log(`✅ Email sent successfully:`, emailResponse);

    // Log email in database
    if (body.isp_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase.from("email_logs").insert({
        isp_id: body.isp_id,
        to_email: Array.isArray(body.to) ? body.to.join(", ") : body.to,
        template: body.template,
        subject,
        status: "sent",
        external_id: emailResponse.data?.id,
        sent_by: userId
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_id: emailResponse.data?.id,
        message: "Email enviado com sucesso"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("❌ Error sending email:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: "Internal error", message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
