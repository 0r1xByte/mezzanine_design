interface MemberRow {
  mark: string;
  role: string;
  section: string;
  span_m: number | null;
  utilisation: number;
  status: 'pass' | 'review';
}

interface DesignOutput {
  members: MemberRow[];
  steel_weight_kg: number;
  deck_area_m2: number;
  checks_passed: number;
  checks_total: number;
  warnings: string[];
}

interface DesignRevisionLike {
  revisionNumber: number;
  input: unknown;
  output: unknown;
}

export interface ImpactReport {
  fromRevision: number;
  toRevision: number;
  changedInputSections: string[];
  memberChanges: string[];
  metricChanges: string[];
  warningChanges: string[];
  unchanged: boolean;
}

function inputSection(input: unknown, key: string): unknown {
  if (input && typeof input === 'object' && key in input) {
    return (input as Record<string, unknown>)[key];
  }
  return undefined;
}

function diffInputs(from: unknown, to: unknown): string[] {
  const sections = ['geometry', 'loads', 'structural_config'];
  return sections.filter(
    (key) => JSON.stringify(inputSection(from, key)) !== JSON.stringify(inputSection(to, key)),
  );
}

function diffMembers(from: DesignOutput, to: DesignOutput): string[] {
  const changes: string[] = [];
  const fromByMark = new Map(from.members.map((m) => [m.mark, m]));
  const toByMark = new Map(to.members.map((m) => [m.mark, m]));

  for (const [mark, toMember] of toByMark) {
    const fromMember = fromByMark.get(mark);
    if (!fromMember) {
      changes.push(`New member ${mark} added (${toMember.section}).`);
      continue;
    }
    if (fromMember.section !== toMember.section) {
      changes.push(`Member ${mark} resized from ${fromMember.section} to ${toMember.section}.`);
    }
    if (fromMember.status !== toMember.status) {
      changes.push(
        toMember.status === 'review'
          ? `Member ${mark} now requires review (utilisation ${toMember.utilisation}).`
          : `Member ${mark} now passes (utilisation ${toMember.utilisation}).`,
      );
    }
  }

  for (const [mark, fromMember] of fromByMark) {
    if (!toByMark.has(mark)) {
      changes.push(`Member ${mark} removed (was ${fromMember.section}).`);
    }
  }

  return changes;
}

function diffMetrics(from: DesignOutput, to: DesignOutput): string[] {
  const changes: string[] = [];
  const weightDelta = to.steel_weight_kg - from.steel_weight_kg;
  if (Math.abs(weightDelta) > 0.5) {
    const direction = weightDelta > 0 ? 'up' : 'down';
    changes.push(`Steel weight ${direction} ${Math.abs(weightDelta).toFixed(1)} kg (${from.steel_weight_kg} → ${to.steel_weight_kg} kg).`);
  }
  const deckDelta = to.deck_area_m2 - from.deck_area_m2;
  if (Math.abs(deckDelta) > 0.1) {
    const direction = deckDelta > 0 ? 'up' : 'down';
    changes.push(`Deck area ${direction} ${Math.abs(deckDelta).toFixed(1)} m² (${from.deck_area_m2} → ${to.deck_area_m2} m²).`);
  }
  if (from.checks_passed !== to.checks_passed || from.checks_total !== to.checks_total) {
    changes.push(
      `Checks passed changed from ${from.checks_passed}/${from.checks_total} to ${to.checks_passed}/${to.checks_total}.`,
    );
  }
  return changes;
}

function diffWarnings(from: DesignOutput, to: DesignOutput): string[] {
  const changes: string[] = [];
  const fromSet = new Set(from.warnings);
  const toSet = new Set(to.warnings);
  for (const warning of toSet) {
    if (!fromSet.has(warning)) changes.push(`New flag: ${warning}`);
  }
  for (const warning of fromSet) {
    if (!toSet.has(warning)) changes.push(`Resolved flag: ${warning}`);
  }
  return changes;
}

export function buildImpactReport(from: DesignRevisionLike, to: DesignRevisionLike): ImpactReport {
  const fromOutput = from.output as DesignOutput;
  const toOutput = to.output as DesignOutput;

  const changedInputSections = diffInputs(from.input, to.input);
  const memberChanges = diffMembers(fromOutput, toOutput);
  const metricChanges = diffMetrics(fromOutput, toOutput);
  const warningChanges = diffWarnings(fromOutput, toOutput);

  return {
    fromRevision: from.revisionNumber,
    toRevision: to.revisionNumber,
    changedInputSections,
    memberChanges,
    metricChanges,
    warningChanges,
    unchanged:
      changedInputSections.length === 0 &&
      memberChanges.length === 0 &&
      metricChanges.length === 0 &&
      warningChanges.length === 0,
  };
}
