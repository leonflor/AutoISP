// ═══ ONU Signal Analyzer Module ═══
// Pure functions for optical signal classification and diagnostics.
// Zero dependencies — shared between Edge Functions and frontend.

export type SignalQuality =
  | "critical"
  | "weak"
  | "acceptable"
  | "excellent"
  | "ideal"
  | "saturated"
  | "low"
  | "unknown";

export interface OnuSignalInput {
  tx: number | null;
  rx: number | null;
}

export interface SignalClassification {
  value: number;
  unit: "dBm";
  status: SignalQuality;
  level: string;
  message: string;
  emoji: string;
}

export interface OnuSignalResult {
  equipmentStatus: "online" | "offline" | "unknown";
  isOffline: boolean;
  rx: SignalClassification | null;
  tx: SignalClassification | null;
  diagnosis: string;
  recommendedAction: string;
  severity: 0 | 1 | 2 | 3;
}

/** Configurable thresholds — future: load from platform_config */
export const SIGNAL_THRESHOLDS = {
  rx: { saturated: -8, excellent: -20, acceptable: -25, weak: -28 },
  tx: { saturated: 2, ideal: 0, acceptable: -2 },
} as const;

// ═══ CLASSIFICADORES ═══

export function classifyRX(rx: number) {
  const t = SIGNAL_THRESHOLDS.rx;
  if (rx > t.saturated)
    return { status: "saturated" as const, level: "Saturado", message: "Risco de dano ao equipamento", emoji: "🔴" };
  if (rx >= t.excellent)
    return { status: "excellent" as const, level: "Excelente", message: "Sinal ideal", emoji: "🟢" };
  if (rx >= t.acceptable)
    return { status: "acceptable" as const, level: "Aceitável", message: "Funcionando, mas atenção", emoji: "🟡" };
  if (rx >= t.weak)
    return { status: "weak" as const, level: "Fraco", message: "Risco de instabilidade", emoji: "🟠" };
  return { status: "critical" as const, level: "Crítico", message: "Problema grave de sinal", emoji: "🔴" };
}

export function classifyTX(tx: number) {
  const t = SIGNAL_THRESHOLDS.tx;
  if (tx > t.saturated)
    return { status: "saturated" as const, level: "Alto demais", message: "Risco de saturação", emoji: "🔴" };
  if (tx >= t.ideal)
    return { status: "ideal" as const, level: "Ideal", message: "Transmissão perfeita", emoji: "🟢" };
  if (tx >= t.acceptable)
    return { status: "acceptable" as const, level: "Aceitável", message: "Funcionando normalmente", emoji: "🟡" };
  return { status: "low" as const, level: "Baixo", message: "Verificar equipamento", emoji: "🟠" };
}

// ═══ ANALISADOR PRINCIPAL ═══

export function analyzeOnuSignal(input: OnuSignalInput): OnuSignalResult {
  const { tx, rx } = input;

  if (tx === null && rx === null) {
    return {
      equipmentStatus: "unknown",
      isOffline: false,
      rx: null,
      tx: null,
      diagnosis: "Não foi possível obter leitura do sinal",
      recommendedAction: "Verificar conexão com equipamento",
      severity: 2,
    };
  }

  if (tx === 0 && rx === 0) {
    return {
      equipmentStatus: "offline",
      isOffline: true,
      rx: { value: 0, unit: "dBm", status: "critical", level: "Offline", message: "Sem sinal", emoji: "⚫" },
      tx: { value: 0, unit: "dBm", status: "critical", level: "Offline", message: "Sem sinal", emoji: "⚫" },
      diagnosis: "Equipamento OFFLINE detectado (TX: 0.00 / RX: 0.00)",
      recommendedAction: "Confirmar problema de ENERGIA",
      severity: 3,
    };
  }

  const rxI = rx !== null ? classifyRX(rx) : null;
  const txI = tx !== null ? classifyTX(tx) : null;

  const rxCritical = rxI?.status === "critical" || rxI?.status === "saturated";
  const txCritical = txI?.status === "saturated";

  let diagnosis: string, action: string, severity: 0 | 1 | 2 | 3;

  if (rxCritical || txCritical) {
    diagnosis = "Problema crítico de sinal detectado";
    action = "Abrir atendimento URGENTE para inspeção da rede óptica";
    severity = 3;
  } else if (rxI?.status === "weak") {
    diagnosis = "Sinal de recepção fraco detectado";
    action = "Abrir atendimento para verificar cabo/conector";
    severity = 2;
  } else if (rxI?.status === "excellent" && txI?.status === "ideal") {
    diagnosis = "Sinal óptico dentro dos padrões ideais";
    action = "Problema não está relacionado ao sinal";
    severity = 0;
  } else {
    diagnosis = "Sinal funcionando, mas requer atenção";
    action = "Monitorar e considerar inspeção preventiva";
    severity = 1;
  }

  return {
    equipmentStatus: "online",
    isOffline: false,
    rx: rx !== null && rxI ? { value: rx, unit: "dBm", ...rxI } : null,
    tx: tx !== null && txI ? { value: tx, unit: "dBm", ...txI } : null,
    diagnosis,
    recommendedAction: action,
    severity,
  };
}

// ═══ HELPERS ═══

export function formatSignalReport(r: OnuSignalResult): string {
  const lines = [`📡 Status: ${r.equipmentStatus.toUpperCase()}`];
  if (r.rx) lines.push(`RX: ${r.rx.emoji} ${r.rx.value} dBm (${r.rx.level})`);
  if (r.tx) lines.push(`TX: ${r.tx.emoji} ${r.tx.value} dBm (${r.tx.level})`);
  lines.push(`Diagnóstico: ${r.diagnosis}`, `Ação: ${r.recommendedAction}`);
  return lines.join("\n");
}

/** Quick check: severity >= 2 means attention needed */
export const needsAttention = (r: OnuSignalResult) => r.severity >= 2;

/** Quick check: severity === 3 means urgent */
export const isUrgent = (r: OnuSignalResult) => r.severity === 3;

/**
 * Classify a single signal_db value (from /radusuarios) into a quality level.
 * Used for batch list badges where only one signal value is available.
 */
export function classifySignalDb(signalDb: number | null): SignalQuality {
  if (signalDb === null || signalDb === undefined) return "unknown";
  if (signalDb === 0) return "critical"; // offline
  return classifyRX(signalDb).status;
}
