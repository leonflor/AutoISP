import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestRequest {
  integration: "openai" | "resend" | "asaas";
  credentials: {
    api_key: string;
    environment?: "sandbox" | "production";
    default_model?: string;
    from_email?: string;
    webhook_token?: string;
  };
}

interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}

async function testOpenAI(apiKey: string): Promise<TestResult> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return { 
        success: false, 
        message: error.error?.message || "Chave API inválida ou sem permissão" 
      };
    }
    
    const data = await response.json();
    const gptModels = data.data?.filter((m: { id: string }) => 
      m.id.includes("gpt-4") || m.id.includes("gpt-3.5")
    ) || [];
    
    return { 
      success: true, 
      message: "Conexão estabelecida com OpenAI",
      details: { 
        available_models: gptModels.length,
        models: gptModels.slice(0, 5).map((m: { id: string }) => m.id)
      }
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao conectar com OpenAI" 
    };
  }
}

async function testResend(apiKey: string): Promise<TestResult> {
  try {
    const response = await fetch("https://api.resend.com/domains", {
      headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return { 
        success: false, 
        message: error.message || "Chave API inválida" 
      };
    }
    
    const domains = await response.json();
    return { 
      success: true, 
      message: "Conexão estabelecida com Resend",
      details: { 
        domains_count: domains.data?.length || 0,
        domains: domains.data?.map((d: { name: string }) => d.name) || []
      }
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao conectar com Resend" 
    };
  }
}

async function testAsaas(apiKey: string, environment: string = "production"): Promise<TestResult> {
  try {
    const baseUrl = environment === "production" 
      ? "https://api.asaas.com/v3"
      : "https://sandbox.asaas.com/api/v3";
      
    const response = await fetch(`${baseUrl}/myAccount`, {
      headers: { 
        "access_token": apiKey,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return { 
        success: false, 
        message: error.errors?.[0]?.description || "Chave API inválida ou sem permissão" 
      };
    }
    
    const account = await response.json();
    return { 
      success: true, 
      message: "Conexão estabelecida com Asaas",
      details: { 
        account_name: account.name,
        account_type: account.personType,
        environment: environment
      }
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao conectar com Asaas" 
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { integration, credentials }: TestRequest = await req.json();

    if (!integration || !credentials?.api_key) {
      return new Response(
        JSON.stringify({ success: false, message: "Parâmetros inválidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: TestResult;

    switch (integration) {
      case "openai":
        result = await testOpenAI(credentials.api_key);
        break;
      case "resend":
        result = await testResend(credentials.api_key);
        break;
      case "asaas":
        result = await testAsaas(credentials.api_key, credentials.environment);
        break;
      default:
        result = { success: false, message: "Integração não suportada" };
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: result.success ? 200 : 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in test-integration:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "Erro interno" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
