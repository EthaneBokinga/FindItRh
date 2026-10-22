import { Check } from "lucide-react";
import type { ReactNode } from "react";
import type { Criterion } from "../types";

interface Props {
  criterion: Criterion;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  children?: ReactNode;
}

export default function CriterionItem({ criterion, checked, onToggle, children }: Props) {
  return (
    <div className={`criterion ${checked ? "checked" : ""}`}>
      <label className="criterion-main">
        <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} />
        <span className="box"><Check size={16} strokeWidth={3} /></span>
        <span className="grow">
          <strong>{criterion.question}</strong>
          {criterion.hint && <span className="muted small block">{criterion.hint}</span>}
        </span>
        {criterion.knockout && <span className="tag">Éliminatoire</span>}
      </label>
      {children && <div className="criterion-extra">{children}</div>}
    </div>
  );
}
