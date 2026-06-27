import test from 'node:test';
import assert from 'node:assert/strict';
import { DiagnosticSeverity } from 'vscode-languageserver/node';

import {
  getClearDiagnosticsPayload,
  getPublishDiagnosticsPayload,
  toLspDiagnostics
} from './diagnostics';
import { buildVbaProject } from './vbaProject';

test('diagnostics map syntax diagnostics to LSP errors', () => {
  assert.deepEqual(
    toLspDiagnostics([
      {
        code: 'syntax.invalidTrailingCommentContinuation',
        message: 'Code line-continuation marker cannot be followed by a comment.',
        range: {
          start: { line: 4, character: 16 },
          end: { line: 4, character: 27 }
        },
        severity: 'error',
        source: 'vba-language-server'
      }
    ]),
    [
      {
        code: 'syntax.invalidTrailingCommentContinuation',
        message: 'Code line-continuation marker cannot be followed by a comment.',
        range: {
          start: { line: 4, character: 16 },
          end: { line: 4, character: 27 }
        },
        severity: DiagnosticSeverity.Error,
        source: 'vba-language-server'
      }
    ]
  );
});

test('diagnostics publish payload reflects invalid and valid source states', () => {
  const invalid_line = '        "needle", _ \' comment';
  const invalid_project = buildVbaProject([
    {
      uri: 'file:///project/Worker.bas',
      text: [
        'Attribute VB_Name = "Worker"',
        'Option Explicit',
        '',
        'Public Sub Run()',
        '    ReadValue( _',
        invalid_line,
        'End Sub'
      ].join('\n')
    }
  ]);
  const valid_project = buildVbaProject([
    {
      uri: 'file:///project/Worker.bas',
      text: [
        'Attribute VB_Name = "Worker"',
        'Option Explicit',
        '',
        'Public Sub Run()',
        '    ReadValue( _',
        '        "needle")',
        'End Sub'
      ].join('\n')
    }
  ]);

  assert.deepEqual(getPublishDiagnosticsPayload(invalid_project, 'file:///project/Worker.bas'), {
    uri: 'file:///project/Worker.bas',
    diagnostics: [
      {
        code: 'syntax.invalidTrailingCommentContinuation',
        message: 'Code line-continuation marker cannot be followed by a comment.',
        range: {
          start: { line: 5, character: invalid_line.indexOf('_') },
          end: { line: 5, character: invalid_line.length }
        },
        severity: DiagnosticSeverity.Error,
        source: 'vba-language-server'
      }
    ]
  });
  assert.deepEqual(getPublishDiagnosticsPayload(valid_project, 'file:///project/Worker.bas'), {
    uri: 'file:///project/Worker.bas',
    diagnostics: []
  });
});

test('diagnostics clear payload contains an empty diagnostics array', () => {
  assert.deepEqual(getClearDiagnosticsPayload('file:///project/Worker.bas'), {
    uri: 'file:///project/Worker.bas',
    diagnostics: []
  });
});
