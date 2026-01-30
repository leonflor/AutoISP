import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessRequest {
  document_id: string;
  isp_agent_id: string;
}

interface DocumentRecord {
  id: string;
  isp_id: string;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  isp_agents?: {
    chunk_size?: number;
  } | null;
}

interface OpenAIConfigValue {
  api_key_encrypted?: string;
  encryption_iv?: string;
  default_model?: string;
  masked_key?: string;
  configured?: boolean;
}

// ============= ERROR CODE MAPPING =============
const ERROR_CODES = {
  DOCUMENT_NOT_FOUND: { 
    code: "ERR_DOC_001", 
    message: "Documento não encontrado. Tente reenviar.", 
    step: "download" 
  },
  DOWNLOAD_FAILED: { 
    code: "ERR_DOC_002", 
    message: "Falha ao baixar arquivo. Tente reenviar.", 
    step: "download" 
  },
  EXTRACT_FAILED: { 
    code: "ERR_DOC_003", 
    message: "Não foi possível extrair texto do documento.", 
    step: "extract" 
  },
  CONTENT_TOO_SHORT: { 
    code: "ERR_DOC_004", 
    message: "Conteúdo insuficiente no documento.", 
    step: "extract" 
  },
  CHUNK_FAILED: { 
    code: "ERR_CHUNK_001", 
    message: "Erro ao dividir documento em blocos.", 
    step: "chunk" 
  },
  EMBEDDING_FAILED: { 
    code: "ERR_EMBED_001", 
    message: "Falha na geração de embeddings. Serviço temporariamente indisponível.", 
    step: "embed" 
  },
  EMBEDDING_BAD_REQUEST: { 
    code: "ERR_EMBED_002", 
    message: "Conteúdo do documento não suportado para embeddings.", 
    step: "embed" 
  },
  OPENAI_NOT_CONFIGURED: { 
    code: "ERR_EMBED_003", 
    message: "Integração OpenAI não configurada. Contate o administrador.", 
    step: "embed" 
  },
  OPENAI_RATE_LIMIT: { 
    code: "ERR_EMBED_004", 
    message: "Limite de requisições excedido. Tente novamente em alguns minutos.", 
    step: "embed" 
  },
  INSERT_FAILED: { 
    code: "ERR_DB_001", 
    message: "Erro ao salvar dados processados.", 
    step: "insert" 
  },
  UNKNOWN: { 
    code: "ERR_UNKNOWN", 
    message: "Erro inesperado. Contate o suporte.", 
    step: "unknown" 
  },
} as const;

type ErrorCodeKey = keyof typeof ERROR_CODES;

interface ErrorInfo {
  code: string;
  message: string;
  step: string;
}

// ============= ENCRYPTION HELPERS =============
async function deriveKey(masterKey: string): Promise<CryptoKey> {
  const keyMaterial = new TextEncoder().encode(masterKey);
  const keyData = keyMaterial.slice(0, 32);
  return await crypto.subtle.importKey("raw", keyData, "AES-GCM", false, ["decrypt"]);
}

async function decrypt(ciphertext: string, iv: string, masterKey: string): Promise<string> {
  const key = await deriveKey(masterKey);
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const ciphertextBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, key, ciphertextBytes);
  return new TextDecoder().decode(decrypted);
}

// Get OpenAI API key from platform config
async function getOpenAIKey(supabaseAdmin: SupabaseClient): Promise<string> {
  const masterKey = Deno.env.get("ENCRYPTION_KEY");
  if (!masterKey) {
    throw new Error("ENCRYPTION_KEY not configured");
  }

  const { data: config, error } = await supabaseAdmin
    .from("platform_config")
    .select("value")
    .eq("key", "integration_openai")
    .single();

  if (error || !config) {
    console.error("Failed to fetch OpenAI config:", error);
    throw new Error("OpenAI config not found");
  }

  const value = config.value as OpenAIConfigValue;
  
  if (!value?.api_key_encrypted || !value?.encryption_iv) {
    throw new Error("OpenAI not configured. Configure via admin panel.");
  }

  try {
    return await decrypt(value.api_key_encrypted, value.encryption_iv, masterKey);
  } catch (decryptError) {
    console.error("Failed to decrypt OpenAI key:", decryptError);
    throw new Error("Failed to decrypt OpenAI key");
  }
}

// Map raw error message to error code
function mapErrorToCode(error: Error, currentStep: string): ErrorInfo {
  const msg = error.message.toLowerCase();
  
  if (msg.includes("not found") || msg.includes("não encontrado")) {
    return ERROR_CODES.DOCUMENT_NOT_FOUND;
  }
  if (msg.includes("download") || msg.includes("baixar")) {
    return ERROR_CODES.DOWNLOAD_FAILED;
  }
  if (msg.includes("extract") || msg.includes("extrair")) {
    return ERROR_CODES.EXTRACT_FAILED;
  }
  if (msg.includes("sufficient text") || msg.includes("insuficiente")) {
    return ERROR_CODES.CONTENT_TOO_SHORT;
  }
  if (msg.includes("chunk") || msg.includes("dividir")) {
    return ERROR_CODES.CHUNK_FAILED;
  }
  if (msg.includes("openai not configured") || msg.includes("configure via admin")) {
    return ERROR_CODES.OPENAI_NOT_CONFIGURED;
  }
  if (msg.includes("rate limit") || msg.includes("429")) {
    return ERROR_CODES.OPENAI_RATE_LIMIT;
  }
  if (msg.includes("embedding") && msg.includes("bad request")) {
    return ERROR_CODES.EMBEDDING_BAD_REQUEST;
  }
  if (msg.includes("embedding")) {
    return ERROR_CODES.EMBEDDING_FAILED;
  }
  if (msg.includes("insert") || msg.includes("salvar")) {
    return ERROR_CODES.INSERT_FAILED;
  }
  
  // Return error with current step context
  return {
    code: ERROR_CODES.UNKNOWN.code,
    message: ERROR_CODES.UNKNOWN.message,
    step: currentStep
  };
}

// Log error to processing logs table
async function logProcessingError(
  supabaseAdmin: SupabaseClient,
  documentId: string,
  ispId: string,
  ispAgentId: string,
  errorInfo: ErrorInfo,
  originalError: Error,
  context?: Record<string, unknown>
) {
  try {
    await supabaseAdmin.from("document_processing_logs").insert({
      document_id: documentId,
      isp_id: ispId,
      isp_agent_id: ispAgentId,
      error_code: errorInfo.code,
      error_message: errorInfo.message,
      error_details: {
        original_error: originalError.message,
        stack: originalError.stack?.split("\n").slice(0, 5),
        step_context: context || {}
      },
      processing_step: errorInfo.step
    });
    console.log(`📝 Error logged: ${errorInfo.code} at step ${errorInfo.step}`);
  } catch (logError) {
    console.error("Failed to log processing error:", logError);
  }
}

// Simple text chunker with overlap
function chunkText(text: string, chunkSize: number, overlapPercent: number = 0.1): string[] {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunks: string[] = [];
  const overlap = Math.floor(chunkSize * overlapPercent);
  
  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    if (chunkWords.length > 0) {
      chunks.push(chunkWords.join(" "));
    }
    i += chunkSize - overlap;
    if (i >= words.length - overlap && chunks.length > 0) break;
  }
  
  return chunks;
}

// Extract text from different file types
async function extractText(content: Uint8Array, mimeType: string): Promise<string> {
  const decoder = new TextDecoder("utf-8");
  
  if (mimeType === "text/plain") {
    return decoder.decode(content);
  }
  
  if (mimeType === "application/pdf") {
    // For PDF, we'll extract raw text patterns (simplified approach)
    const text = decoder.decode(content);
    // Extract text between BT/ET markers or plain text content
    const textMatches = text.match(/\((.*?)\)/g) || [];
    const extractedText = textMatches
      .map(m => m.slice(1, -1))
      .filter(t => t.length > 2 && /[a-zA-Z]/.test(t))
      .join(" ");
    
    if (extractedText.length < 100) {
      // Fallback: extract any readable ASCII sequences
      const readable = text.match(/[a-zA-Z0-9\s.,!?;:'"()-]{10,}/g) || [];
      return readable.join(" ").slice(0, 50000);
    }
    return extractedText.slice(0, 50000);
  }
  
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    // DOCX: Extract text from XML content
    const text = decoder.decode(content);
    const textMatches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    return textMatches
      .map(m => m.replace(/<[^>]+>/g, ""))
      .join(" ")
      .slice(0, 50000);
  }
  
  if (mimeType === "application/vnd.oasis.opendocument.text") {
    // ODT: Extract text from XML content
    const text = decoder.decode(content);
    const textMatches = text.match(/<text:p[^>]*>([^<]*)/g) || [];
    return textMatches
      .map(m => m.replace(/<[^>]+>/g, ""))
      .join(" ")
      .slice(0, 50000);
  }
  
  // Default: try to decode as text
  return decoder.decode(content).slice(0, 50000);
}

// Generate embedding using OpenAI API directly
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000), // Limit input size
      dimensions: 768
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded (429)");
    }
    
    throw new Error(`Embedding error: ${errorData.error?.message || response.statusText}`);
  }
  
  const data = await response.json();
  return data.data[0].embedding;
}

// Background processing function
async function processDocumentBackground(
  documentId: string,
  ispAgentId: string,
  supabaseAdmin: SupabaseClient,
  apiKey: string
) {
  console.log(`📄 Starting background processing for document: ${documentId}`);
  
  let doc: DocumentRecord | null = null;
  let currentStep = "init";
  
  try {
    // Update status to processing
    currentStep = "update_status";
    await supabaseAdmin
      .from("knowledge_documents")
      .update({ status: "processing", updated_at: new Date().toISOString() } as Record<string, unknown>)
      .eq("id", documentId);
    
    // Get document details
    currentStep = "fetch_document";
    const { data: docData, error: docError } = await supabaseAdmin
      .from("knowledge_documents")
      .select("*, isp_agents(chunk_size)")
      .eq("id", documentId)
      .single();
    
    if (docError || !docData) {
      throw new Error(`Document not found: ${docError?.message}`);
    }
    
    doc = docData as unknown as DocumentRecord;
    
    // Download file from storage
    currentStep = "download";
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from("knowledge-docs")
      .download(doc.storage_path);
    
    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }
    
    const content = new Uint8Array(await fileData.arrayBuffer());
    console.log(`📥 Downloaded file: ${doc.original_filename}, size: ${content.length} bytes`);
    
    // Extract text
    currentStep = "extract";
    const extractedText = await extractText(content, doc.mime_type);
    console.log(`📝 Extracted text length: ${extractedText.length} chars`);
    
    if (extractedText.length < 50) {
      throw new Error("Could not extract sufficient text from document");
    }
    
    // Get chunk size from agent config or use default
    const chunkSize = doc.isp_agents?.chunk_size || 500;
    
    // Chunk the text
    currentStep = "chunk";
    const chunks = chunkText(extractedText, chunkSize, 0.1);
    console.log(`🔪 Created ${chunks.length} chunks with size ~${chunkSize} words`);
    
    // Process each chunk
    currentStep = "embed";
    const chunkRecords: Record<string, unknown>[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      console.log(`🧠 Generating embedding for chunk ${i + 1}/${chunks.length}`);
      const embedding = await generateEmbedding(chunk, apiKey);
      
      chunkRecords.push({
        document_id: documentId,
        isp_agent_id: ispAgentId,
        isp_id: doc.isp_id,
        content: chunk,
        embedding: `[${embedding.join(",")}]`,
        chunk_index: i,
        metadata: {
          word_count: chunk.split(/\s+/).length,
          char_count: chunk.length
        }
      });
      
      // Small delay to avoid rate limiting
      if (i < chunks.length - 1) {
        await new Promise(r => setTimeout(r, 100));
      }
    }
    
    // Insert all chunks
    currentStep = "insert";
    const { error: insertError } = await supabaseAdmin
      .from("document_chunks")
      .insert(chunkRecords as Record<string, unknown>[]);
    
    if (insertError) {
      throw new Error(`Failed to insert chunks: ${insertError.message}`);
    }
    
    // Update document status
    await supabaseAdmin
      .from("knowledge_documents")
      .update({
        status: "indexed",
        chunk_count: chunks.length,
        indexed_at: new Date().toISOString(),
        error_message: null,
        updated_at: new Date().toISOString()
      } as Record<string, unknown>)
      .eq("id", documentId);
    
    console.log(`✅ Document processed successfully: ${chunks.length} chunks indexed`);
    
  } catch (error) {
    console.error(`❌ Error processing document at step ${currentStep}:`, error);
    
    const err = error instanceof Error ? error : new Error("Unknown error");
    const errorInfo = mapErrorToCode(err, currentStep);
    
    // Log detailed error for admin visibility
    if (doc) {
      await logProcessingError(
        supabaseAdmin,
        documentId,
        doc.isp_id,
        ispAgentId,
        errorInfo,
        err,
        {
          step: currentStep,
          filename: doc.original_filename,
          mime_type: doc.mime_type
        }
      );
    }
    
    // Update document with friendly error message (code + message)
    await supabaseAdmin
      .from("knowledge_documents")
      .update({
        status: "error",
        error_message: `${errorInfo.code} - ${errorInfo.message}`,
        updated_at: new Date().toISOString()
      } as Record<string, unknown>)
      .eq("id", documentId);
  }
}

// Declare EdgeRuntime for Deno
declare const EdgeRuntime: {
  waitUntil: (promise: Promise<unknown>) => void;
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Validate JWT
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized", message: "Token não fornecido" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Validate user token
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabaseAuth.auth.getClaims(token);
    
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const userId = claims.claims.sub;
    
    // Parse request
    const body: ProcessRequest = await req.json();
    
    if (!body.document_id || !body.isp_agent_id) {
      return new Response(
        JSON.stringify({ error: "Validation error", message: "Campos obrigatórios: document_id, isp_agent_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get OpenAI API key from platform config
    let openaiKey: string;
    try {
      openaiKey = await getOpenAIKey(supabaseAdmin);
      console.log("🔑 OpenAI key retrieved from platform config");
    } catch (keyError) {
      console.error("Failed to get OpenAI key:", keyError);
      return new Response(
        JSON.stringify({
          error: "SERVICE_NOT_CONFIGURED",
          message: "Integração OpenAI não configurada. Configure via painel admin."
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Verify user has access to the document
    const { data: docData, error: docError } = await supabaseAdmin
      .from("knowledge_documents")
      .select("isp_id")
      .eq("id", body.document_id)
      .single();
    
    if (docError || !docData) {
      return new Response(
        JSON.stringify({ error: "Not found", message: "Documento não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const doc = docData as { isp_id: string };
    
    // Verify user is ISP admin
    const { data: membership } = await supabaseAdmin
      .from("isp_users")
      .select("role")
      .eq("isp_id", doc.isp_id)
      .eq("user_id", userId)
      .eq("is_active", true)
      .in("role", ["owner", "admin"])
      .single();
    
    if (!membership) {
      return new Response(
        JSON.stringify({ error: "Forbidden", message: "Apenas administradores podem processar documentos" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Start background processing
    EdgeRuntime.waitUntil(
      processDocumentBackground(body.document_id, body.isp_agent_id, supabaseAdmin, openaiKey)
    );
    
    console.log(`🚀 Document processing started in background: ${body.document_id}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Processamento iniciado em segundo plano",
        document_id: body.document_id
      }),
      { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("❌ Error:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: "Internal error", message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
