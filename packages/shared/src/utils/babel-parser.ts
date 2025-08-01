import * as babelParser from '@babel/parser';
import * as babelTypes from '@babel/types';

const defaultPlugins: babelParser.ParserOptions['plugins'] = [
  'jsx',
  'typescript',
  'asyncGenerators',
  'bigInt',
  'classProperties',
  'classPrivateProperties',
  'classPrivateMethods',
  // [
  //   'decorators',
  //   {
  //     decoratorsBeforeExport: true,
  //   },
  // ],
  'decorators-legacy',
  'doExpressions',
  'dynamicImport',
  'exportDefaultFrom',
  'exportNamespaceFrom',
  'functionBind',
  'functionSent',
  'importMeta',
  'logicalAssignment',
  'nullishCoalescingOperator',
  'numericSeparator',
  'objectRestSpread',
  'optionalCatchBinding',
  'optionalChaining',
  [
    'pipelineOperator',
    {
      proposal: 'minimal',
    },
  ],
  'throwExpressions',
  'topLevelAwait',
];

function buildOptions(parserOptions: babelParser.ParserOptions = {}) {
  const parserOpts: babelParser.ParserOptions = {
    sourceType: 'module',
    strictMode: false,
    tokens: true,
    ...parserOptions,
    plugins: [
      ...(defaultPlugins || []),
      ...(parserOptions.plugins || []),
    ],
  };

  return parserOpts;
}

export function buildParse(options: babelParser.ParserOptions = {}): { parse: (src: string) => babelParser.ParseResult<babelTypes.File> } {
  const parserOpts = buildOptions(options);

  return {
    parse(src) {
      return babelParser.parse(src, {
        ...parserOpts,
      });
    },
  };
}
