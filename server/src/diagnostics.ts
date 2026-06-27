import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver/node';

import { getSyntaxDiagnostics, SyntaxDiagnostic, VbaProject } from './vbaProject';

export interface PublishDiagnosticsPayload {
  uri: string;
  diagnostics: Diagnostic[];
}

export function getPublishDiagnosticsPayload(project: VbaProject, uri: string): PublishDiagnosticsPayload {
  return {
    uri,
    diagnostics: toLspDiagnostics(getSyntaxDiagnostics(project, uri))
  };
}

export function getClearDiagnosticsPayload(uri: string): PublishDiagnosticsPayload {
  return {
    uri,
    diagnostics: []
  };
}

export function toLspDiagnostics(diagnostics: SyntaxDiagnostic[]): Diagnostic[] {
  return diagnostics.map((diagnostic) => ({
    code: diagnostic.code,
    message: diagnostic.message,
    range: Range.create(diagnostic.range.start, diagnostic.range.end),
    severity: DiagnosticSeverity.Error,
    source: diagnostic.source
  }));
}
