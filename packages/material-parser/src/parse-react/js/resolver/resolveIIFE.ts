import resolveFunctionDefinitionToReturnValue from '../../../react-docgen/utils/resolveFunctionDefinitionToReturnValue';
import checkIsIIFE from './checkIsIIFE';

/**
 * If the path is a call expression, it recursively resolves to the
 * rightmost argument, stopping if it finds a React.createClass call expression
 *
 * Else the path itself is returned.
 */
export default function resolveIIFE(path: any) {
  if (!checkIsIIFE(path)) {
    return path;
  }
  const returnValue = resolveFunctionDefinitionToReturnValue(
    path.get('callee'),
  );

  return returnValue;
}
