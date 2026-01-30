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

// Generate embedding using Lovable AI Gateway
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
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
    const error = await response.json();
    throw new Error(`Embedding error: ${error.error?.message || response.statusText}`);
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
  
  try {
    // Update status to processing
    await supabaseAdmin
      .from("knowledge_documents")
      .update({ status: "processing", updated_at: new Date().toISOString() } as Record<string, unknown>)
      .eq("id", documentId);
    
    // Get document details
    const { data: docData, error: docError } = await supabaseAdmin
      .from("knowledge_documents")
      .select("*, isp_agents(chunk_size)")
      .eq("id", documentId)
      .single();
    
    if (docError || !docData) {
      throw new Error(`Document not found: ${docError?.message}`);
    }
    
    const doc = docData as unknown as DocumentRecord;
    
    // Download file from storage
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
    const extractedText = await extractText(content, doc.mime_type);
    console.log(`📝 Extracted text length: ${extractedText.length} chars`);
    
    if (extractedText.length < 50) {
      throw new Error("Could not extract sufficient text from document");
    }
    
    // Get chunk size from agent config or use default
    const chunkSize = doc.isp_agents?.chunk_size || 500;
    
    // Chunk the text
    const chunks = chunkText(extractedText, chunkSize, 0.1);
    console.log(`🔪 Created ${chunks.length} chunks with size ~${chunkSize} words`);
    
    // Process each chunk
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
        updated_at: new Date().toISOString()
      } as Record<string, unknown>)
      .eq("id", documentId);
    
    console.log(`✅ Document processed successfully: ${chunks.length} chunks indexed`);
    
  } catch (error) {
    console.error(`❌ Error processing document:`, error);
    
    // Update document with error status
    await supabaseAdmin
      .from("knowledge_documents")
      .update({
        status: "error",
        error_message: error instanceof Error ? error.message : "Unknown error",
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
  
  // Check API key
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    console.warn("⚠️ LOVABLE_API_KEY not configured");
    return new Response(
      JSON.stringify({
        error: "SERVICE_NOT_CONFIGURED",
        message: "Gateway de IA não configurado para embeddings."
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      processDocumentBackground(body.document_id, body.isp_agent_id, supabaseAdmin, LOVABLE_API_KEY)
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
