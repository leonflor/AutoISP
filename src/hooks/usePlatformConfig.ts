import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { PlatformConfig } from "@/types/database";
import { useToast } from "@/hooks/use-toast";

interface ConfigValue {
  value?: string | number | boolean | null;
  configured?: boolean;
  tested_at?: string | null;
}

export interface ConfigMap {
  [key: string]: ConfigValue;
}

export function usePlatformConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // All hooks must be called first, in consistent order
  const { data: configs, isLoading, error } = useQuery({
    queryKey: ["platform-config"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("platform_config")
        .select("*")
        .order("category");

      if (error) throw error;
      return data as PlatformConfig[];
    },
  });

  // Update a single config
  const updateConfigMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: ConfigValue }) => {
      const { error } = await (supabase as any)
        .from("platform_config")
        .update({ 
          value, 
          updated_at: new Date().toISOString() 
        })
        .eq("key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-config"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message,
      });
    },
  });

  // Batch update multiple configs
  const batchUpdateMutation = useMutation({
    mutationFn: async (updates: { key: string; value: ConfigValue }[]) => {
      const promises = updates.map(({ key, value }) =>
        (supabase as any)
          .from("platform_config")
          .update({ 
            value, 
            updated_at: new Date().toISOString() 
          })
          .eq("key", key)
      );

      const results = await Promise.all(promises);
      
      const errors = results.filter((r: any) => r.error);
      if (errors.length > 0) {
        throw new Error(`Falha ao atualizar ${errors.length} configurações`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-config"] });
      toast({
        title: "Configurações salvas",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message,
      });
    },
  });

  // Transform configs array to a key-value map - memoized for stability
  const configMap: ConfigMap = useMemo(() => {
    return configs?.reduce((acc, config) => {
      acc[config.key] = config.value as ConfigValue;
      return acc;
    }, {} as ConfigMap) ?? {};
  }, [configs]);

  // Get a specific config value with type safety - regular function, not a hook
  const getValue = <T,>(key: string, defaultValue: T): T => {
    const config = configMap[key];
    if (!config || config.value === undefined || config.value === null) {
      return defaultValue;
    }
    return config.value as T;
  };

  return {
    configs,
    configMap,
    isLoading,
    error,
    getValue,
    updateConfig: updateConfigMutation.mutate,
    batchUpdate: batchUpdateMutation.mutate,
    isUpdating: updateConfigMutation.isPending || batchUpdateMutation.isPending,
  };
}
