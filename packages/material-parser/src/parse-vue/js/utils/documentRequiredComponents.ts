import Map from 'ts-map';
import * as path from 'path';
import { ImportedVariableSet } from './resolveRequired';
import recursiveResolveIEV from '../utils/recursiveResolveIEV';
import type { ParseOptions } from '../types';
import Documentation from '../Documentation';
import makePathResolver from './makePathResolver';

/**
 * Document all components in varToFilePath in documentation
 * Instead of giving it only one component file, here we give it a whole set of variable -> file
 *
 * @param documentation if omitted (undefined), it will return all docs in an array
 * @param varToFilePath variable of object to document
 * @param originObject to build the origin flag
 * @param opt parsing options
 */
export default async function documentRequiredComponents(
  parseFile: (
    opt: ParseOptions,
    documentation?: Documentation,
  ) => Promise<Documentation[]>,
  documentation: Documentation | undefined,
  varToFilePath: ImportedVariableSet,
  originObject: 'extends' | 'mixin' | undefined,
  opt: ParseOptions,
): Promise<Documentation[]> {
  const originalDirName = path.dirname(opt.filePath);
  const pathResolver = makePathResolver(
    originalDirName,
    opt.alias,
    opt.modules,
  );

  // resolve where components are through immediately exported variables
  await recursiveResolveIEV(pathResolver, varToFilePath, opt.validExtends);

  // if we are in a mixin or an extend we want to add
  // all props on the current doc, instead of creating another one
  if (originObject && documentation) {
    return [
      await enrichDocumentation(
        parseFile,
        documentation,
        varToFilePath,
        originObject,
        opt,
        pathResolver as any,
      ),
    ];
  }

  // else if we have an iev (Immediately Exported Variable) we want to create a new doc
  // for each of them and return them in a flat array

  // first we consolidate all the files we have to parse
  const files = new Map<string, { exportName: string; varName: string }[]>();
  for (const varName of Object.keys(varToFilePath)) {
    const { filePath, exportName } = varToFilePath[varName];
    filePath.forEach((p) => {
      const fullFilePath = pathResolver(p);
      if (fullFilePath && opt.validExtends(fullFilePath)) {
        const vars = files.get(fullFilePath) || [];
        vars.push({ exportName, varName });
        files.set(fullFilePath, vars);
      }
    });
  }

  // by now we should have a set of filePath that we can iterate through to get all missing docs

  // parse all files and get their docs
  const docsArray = await Promise.all(
    files.keys().map(async (fullFilePath): Promise<Documentation[]> => {
      const vars = files.get(fullFilePath) || [];
      const temporaryDocs = await parseFile(
        {
          ...opt,
          filePath: fullFilePath,
          nameFilter: vars.map((v) => v.exportName),
        },
        documentation,
      );
      // then assign each doc in one to the correct exported varname in the root file
      temporaryDocs.forEach((d) =>
        d.set(
          'exportName',
          (vars.find((v) => v.exportName === d.get('exportName')) || {})
            .varName,
        ),
      );
      return temporaryDocs;
    }),
  );

  // flatten array of docs
  return docsArray.reduce((a, i) => a.concat(i), []);
}

async function enrichDocumentation(
  parseFile: (
    opt: ParseOptions,
    documentation?: Documentation,
  ) => Promise<Documentation[]>,
  documentation: Documentation,
  varToFilePath: ImportedVariableSet,
  originObject: 'extends' | 'mixin',
  opt: ParseOptions,
  pathResolver: (pat?: string) => string | null,
): Promise<Documentation> {
  await Object.keys(varToFilePath).reduce(async (_, varName) => {
    await _;
    const { filePath, exportName } = varToFilePath[varName];

    // If there is more than one filepath for a variable, only one
    // will be valid. if not the parser of the browser will shout.
    // We therefore do not care in which order the filepath go as
    // long as we follow the variables order
    await Promise.all(
      filePath.map(async (p) => {
        const fullFilePath = pathResolver(p);

        if (fullFilePath && opt.validExtends(fullFilePath)) {
          try {
            const originVar = {
              [originObject]: {
                name: '-',
                path: path.relative(
                  path.dirname(documentation.componentFullfilePath),
                  fullFilePath,
                ),
              },
            };

            await parseFile(
              {
                ...opt,
                filePath: fullFilePath,
                nameFilter: [exportName],
                ...originVar,
              },
              documentation,
            );

            documentation.sourceFiles.add(fullFilePath);
            if (documentation && originVar[originObject]) {
              originVar[originObject].name =
                documentation.get('displayName') ||
                documentation.get('exportName');
              documentation.set('displayName', null);
            }
          } catch (e) {
            // eat the error
          }
        }
      }),
    );
  }, Promise.resolve());
  return documentation;
}
