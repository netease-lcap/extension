import { ParserPlugin } from '@babel/parser';
import { parse } from 'recast';
import buildParser from './babel-parser';
import Documentation from './Documentation';
import type { ParseFileFunction, ParseOptions } from './types';
import cacher from './utils/cacher';
import { addDefaultAndExecuteHandlers } from './utils/execute-handlers';
import { findAllExportedComponentDefinition } from './resolver';


const ERROR_MISSING_DEFINITION = 'No suitable component definition found';

export default async function parseScript(
  parseFile: ParseFileFunction,
  source: string,
  options: ParseOptions,
  documentation?: Documentation,
  forceSingleExport = false,
  noNeedForExport = false,
): Promise<Documentation[] | undefined> {
  const plugins: ParserPlugin[] =
    options.lang === 'ts' ? ['typescript'] : ['flow'];
  if (options.jsx) {
    plugins.push('jsx');
  }

  const ast = cacher(
    () => parse(source, { parser: buildParser({ plugins }) }),
    source,
  );
  if (!ast) {
    throw new Error(`Unable to parse empty file "${options.filePath}"`);
  }

  ast.program.__path = options.filePath;
  const componentDefinitions = findAllExportedComponentDefinition(ast.program);

  if (componentDefinitions.size === 0) {
    throw new Error(`${ERROR_MISSING_DEFINITION} on "${options.filePath}"`);
  }

  return addDefaultAndExecuteHandlers(
    componentDefinitions,
    ast,
    options,
    {
      parseFile,
    },
    documentation,
    forceSingleExport,
  );
}
