import { expect, test } from 'vitest';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import transformFunc2NaslLogic from '../src/transforms/transform-func2nasl-logic';

const code = `
/**
 * @NaslLogic
 * @title 过滤列表
 * @desc 泛型示例-过滤列表中的 null 数据
 * @param list 列表
 * @returns 列表
 */
export function filterNull<T>(list: nasl.collection.List<T>): nasl.collection.List<T> {
    return list.filter(n => !!n);
}

/**
 * @NaslLogic
 * @title 过滤列表
 * @desc 泛型示例-过滤列表中的 null 数据
 * @param list 列表
 * @returns 列表
 */
export function filter<T>(list: T[], callback: (n: T) => boolean): nasl.collection.List<T> {
    return list.filter(n => !!n);
}

/**
 * @NaslLogic
 * @title 过滤列表异步
 * @desc 泛型示例-过滤列表中的 null 数据
 * @param list 列表
 * @returns 列表
 */
export async function filterAsync<T>(list: T[], callback: (n: T) => boolean): Promise<nasl.collection.List<T>> {
    return list.filter(n => !!n);
}
`;
test('test nasl logic', () => {
  const logics: any[] = [];
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });

  traverse(ast, {
    ExportNamedDeclaration(p) {
      const logic = transformFunc2NaslLogic(p.node);
      if (logic) {
        logics.push(logic);
      }
    },
  });

  expect(logics).toMatchSnapshot();
});
