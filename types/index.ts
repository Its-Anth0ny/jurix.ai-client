export type DocumentStatus = 'uploaded' | 'processing' | 'completed' | 'failed' | 'reviewed_approved' | 'reviewed_rejected' | 'reviewed_edited';

export interface User {
  id: string;
  email: string;
}

export interface Document {
  document_id: string;
  status: DocumentStatus;
  file_path?: string;
  created_at?: string;
  stage?: 'extracting' | 'generating_action' | 'auditing' | 'done';
}

export interface CaseDetails {
  case_number?: string;
  court?: string;
  judge?: string;
  case_type?: string;
  filing_date?: string;
  hearing_date?: string;
}

export interface Parties {
  plaintiff?: string;
  defendant?: string;
  other_parties?: string[];
}

export interface Citation {
  text: string;
  page: number;
}

export interface Extraction {
  case_details: CaseDetails;
  parties: Parties;
  final_order: string;
  deadlines: string[];
  citations: Citation[];
}

export interface ActionItem {
  action: string;
  deadline?: string;
  responsible_party?: string;
}

export interface ActionPlan {
  decision: 'comply' | 'appeal';
  actions: ActionItem[];
  department: string;
  deadlines: string[];
}

export interface AuditResult {
  status: 'approved' | 'needs_review';
  issues: string[];
}

export interface DocumentDetail extends Document {
  extraction?: Extraction;
  action_plan?: ActionPlan;
  audit?: AuditResult;
}

export interface ReviewDecision {
  decision: 'approved' | 'edited' | 'rejected';
  edited_output?: ActionPlan;
}
