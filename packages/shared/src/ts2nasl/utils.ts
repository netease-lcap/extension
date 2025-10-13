import generate from '@babel/generator';
import * as babelTypes from '@babel/types';

export const getNodeCode = (node) => {
  try {
    const { code: text = '' } = generate(node);
    return text.replace(/\n/g, ' ');
  } catch (e) {
    throw new Error(`生成code 错误，${JSON.stringify(node)}`);
  }
};

export const normalizeArray = (arr) => {
  if (!arr) {
    return [];
  }

  return Array.isArray(arr) ? arr : [arr];
};


export function isPromise(node: babelTypes.TSType) {
  return node && node.type === 'TSTypeReference' && node.typeName.type === 'Identifier' && node.typeName.name === 'Promise';
}
