
import * as bt from '@babel/types';
import { NodePath } from 'ast-types/lib/node-path';

export default function isVueExtend(path: NodePath) {
  const { node } = path;

  return bt.isCallExpression(node)
    && bt.isMemberExpression(node.callee)
    && bt.isIdentifier(node.callee.property)
    && node.callee.property.name === 'extend';
};
