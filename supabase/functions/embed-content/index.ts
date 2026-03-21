import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decrypt } from "../_shared/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ~500 tokens ≈ 2000 chars, overlap ~50 tokens ≈ 200 chars
const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;

async function getOpenAIKey(supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const masterKey = Deno.env.get("ENCRYPTION_KEY");
  if (!masterKey || masterKey.length < 32) return null;

  const { data } = await supabase
    .from("platform_config")
    .select("value")
    .eq("key", "integration_openai")
    .maybeSingle();

  if (!data?.value) return null;
  const cfg = data.value as Record<string, unknown>;
  if (!cfg.configured || !cfg.api_key_encrypted || !cfg.encryption_iv) return null;

  return decrypt(cfg.api_key_encrypted as string, cfg.encryption_iv as string, masterKey);
}

function chunkText(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];

  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    if (end >= text.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function generateEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000),
    }),
  });

  if (!res.ok) {
    console.error("[embed-content] OpenAI error:", res.status, await res.text());
    return null;
  }

  const json = await res.json();
  return json.data?.[0]?.embedding ?? null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { knowledge_base_id } = await req.json();
    if (!knowledge_base_id) {
      return new Response(JSON.stringify({ error: "knowledge_base_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the record
    const { data: kb, error: fetchErr } = await supabase
      .from("knowledge_bases")
      .select("*")
      .eq("id", knowledge_base_id)
      .single();

    if (fetchErr || !kb) {
      return new Response(JSON.stringify({ error: "Record not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Set status to indexing
    await supabase.from("knowledge_bases").update({ status: "indexing" }).eq("id", knowledge_base_id);

    // Get OpenAI key
    const apiKey = await getOpenAIKey(supabase);
    if (!apiKey) {
      await supabase.from("knowledge_bases").update({
        status: "error",
        error_message: "OpenAI API key not configured",
      }).eq("id", knowledge_base_id);
      return new Response(JSON.stringify({ error: "OpenAI key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let content = kb.content || "";

    // For URLs, fetch and extract text
    if (kb.source_type === "url" && content.startsWith("http")) {
      try {
        const pageRes = await fetch(content, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; ISPBot/1.0)" },
        });
        if (!pageRes.ok) throw new Error(`HTTP ${pageRes.status}`);
        const html = await pageRes.text();
        const extracted = stripHtml(html);
        // Update content in DB
        await supabase.from("knowledge_bases").update({ content: extracted }).eq("id", knowledge_base_id);
        content = extracted;
      } catch (err) {
        await supabase.from("knowledge_bases").update({
          status: "error",
          error_message: `Failed to fetch URL: ${err.message}`,
        }).eq("id", knowledge_base_id);
        return new Response(JSON.stringify({ error: "URL fetch failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (!content || content.trim().length < 10) {
      await supabase.from("knowledge_bases").update({
        status: "error",
        error_message: "Content too short to index",
      }).eq("id", knowledge_base_id);
      return new Response(JSON.stringify({ error: "Content too short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const chunks = chunkText(content);

    if (chunks.length === 1) {
      // Single chunk: embed directly on the record
      const embedding = await generateEmbedding(chunks[0], apiKey);
      if (!embedding) {
        await supabase.from("knowledge_bases").update({
          status: "error",
          error_message: "Failed to generate embedding",
        }).eq("id", knowledge_base_id);
        return new Response(JSON.stringify({ error: "Embedding failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("knowledge_bases").update({
        embedding: JSON.stringify(embedding),
        status: "indexed",
        error_message: null,
      }).eq("id", knowledge_base_id);
    } else {
      // Multiple chunks: create child records
      let allSuccess = true;
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await generateEmbedding(chunks[i], apiKey);
        if (!embedding) {
          allSuccess = false;
          continue;
        }

        await supabase.from("knowledge_bases").insert({
          tenant_agent_id: kb.tenant_agent_id,
          source_type: kb.source_type,
          title: kb.title ? `${kb.title} (parte ${i + 1})` : `Chunk ${i + 1}`,
          content: chunks[i],
          embedding: JSON.stringify(embedding),
          parent_id: knowledge_base_id,
          status: "indexed",
        });
      }

      await supabase.from("knowledge_bases").update({
        status: allSuccess ? "indexed" : "error",
        error_message: allSuccess ? null : "Some chunks failed to embed",
      }).eq("id", knowledge_base_id);
    }

    return new Response(
      JSON.stringify({ success: true, chunks: chunks.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[embed-content] Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
