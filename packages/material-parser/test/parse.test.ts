import { expect, test } from 'vitest';
import { parse } from '../src';

test('parse ant-design ts', async () => {
  const result = await parse({
    name: 'antd',
    version: '5.23.2',
  });

  expect(result).toMatchSnapshot();
});

test('parse react-colors dynamic', async () => {
  const result = await parse({
    name: 'react-colors',
    version: '0.1.2',
  });

  expect(result).toMatchSnapshot();
});


test('parse vue2 element-ui', async () => {
  const result = await parse({
    name: 'element-ui',
    version: '2.15.14',
  });

  expect(result).toMatchSnapshot();
});

test('parse vue3 element-plus', async () => {
  const result = await parse({
    name: 'element-plus',
    version: '2.9.3',
  });

  expect(result).toMatchSnapshot();
});

test('parse vue2 ant-design-vue js', async () => {
  const result = await parse({
    name: 'ant-design-vue',
    version: '1.7.8',
  });

  expect(result).toMatchSnapshot();
});
