import { STATUS_LABELS, VERDICTS } from "../config";
import type { Status, VerdictKey } from "../types";

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABELS[status]}</span>;
}

export function VerdictBadge({ verdict }: { verdict: VerdictKey }) {
  const v = VERDICTS[verdict];
  return <span className={`badge badge-${v.tone}`}>{v.label}</span>;
}
