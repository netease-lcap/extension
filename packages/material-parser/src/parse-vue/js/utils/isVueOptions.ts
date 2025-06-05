import * as bt from '@babel/types';
import { NodePath } from 'ast-types/lib/node-path';

const VUE_COMPONENTS_KEYS = ['data', 'props', 'methods', 'computed', 'emits', 'extend', 'mixins'];

export default function isVueOptions(path: NodePath) {
  const { node } = path;

  return (
    bt.isObjectExpression(node) &&
    // export const compo = {data(){ return {cpm:"Button"}}
    node.properties.some(
      (p) =>
        (bt.isObjectMethod(p) || bt.isObjectProperty(p) || bt.isProperty(p)) &&
        bt.isIdentifier(p.key) &&
        VUE_COMPONENTS_KEYS.includes(p.key.name),
    )
  );
}
