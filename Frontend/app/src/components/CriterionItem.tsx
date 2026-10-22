import { Check } from "lucide-react";
import type { ReactNode } from "react";
import type { Criterion } from "../types";

interface Props {
  criterion: Criterion;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  children?: ReactNode;
  readonly?: boolean;
}

export default function CriterionItem({ criterion, checked, onToggle, children, readonly }: Props) {
  return (
    <div className={`criterion ${checked ? "checked" : ""} ${readonly ? "criterion-readonly" : ""}`}>
      <label className="criterion-main" style={readonly ? { cursor: "default" } : undefined}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !readonly && onToggle(e.target.checked)}
          disabled={readonly}
        />
        <span className="box"><Check size={16} strokeWidth={3} /></span>
        <span className="grow">
          <strong>{criterion.question}</strong>
          {criterion.hint && !readonly && <span className="muted small block">{criterion.hint}</span>}
        </span>
        {criterion.knockout && <span className="tag">Éliminatoire</span>}
      </label>
      {children && <div className="criterion-extra">{children}</div>}
    </div>
  );
}
