import * as babelTypes from '@babel/types';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import { lowerFirst } from 'lodash';
import { buildParse } from './babel-parser';
import logger from './logger';

export const babelParser = buildParse();

export const evalOptions = (object) => {
  const { code } = generate(object);
  // eslint-disable-next-line no-eval
  const result = eval(`(${code})`);
  if (result.if) {
    result.if = result.if.toString();
    result.tsIf = result.if;
  }

  if (result.disabledIf) {
    result.disabledIf = result.disabledIf.toString();
    result.tsDisabledIf = result.disabledIf;
  }

  if (result.onChange) {
    result.onChange.forEach((item) => {
      if (item.if) item.if = item.if.toString();
    });

    result.tsOnChange = JSON.stringify(result.onChange);
  }

  if (result.designerValue) {
    result.tsDesignerValue = JSON.stringify(result.designerValue);
  }

  return result;
};

export const getNodeCode = (node) => {
  try {
    const { code: text = '' } = generate(node);
    return text.replace(/\n/g, ' ');
  } catch (e) {
    logger.warn(`生成code 错误，${JSON.stringify(node)}`);
  }
  return '';
};

export const getJSXNameByNode = (node) => {
  if (!node || !node.name || node.name.type !== 'JSXIdentifier') {
    return '';
  }

  return node.name.name;
};

export const getSlotName = (slotName) => {
  if (!slotName) {
    return '';
  }

  const slotRegex = /^slot[A-Z].*/;
  if (slotRegex.test(slotName)) {
    return lowerFirst(slotName.substring(4));
  }

  const slotPrefix = 'slot-';
  if (slotName.startsWith(slotPrefix)) {
    return slotName.substring(slotPrefix.length);
  }

  return slotName;
};

const TEMP_IDEUSAGE_VAR_NAME = '_TEMP_VAR';

export function getAST(obj: any, stringify = true) {
  const code = `const ${TEMP_IDEUSAGE_VAR_NAME} = ${stringify ? JSON.stringify(obj) : obj};`;
  const tempAST = babelParser.parse(code);

  let ast;
  if (tempAST) {
    traverse(tempAST, {
      VariableDeclarator(p) {
        if (p.node.id.type === 'Identifier' && p.node.id.name === TEMP_IDEUSAGE_VAR_NAME && p.node.init) {
          ast = p.node.init;
        }
      },
    });
  }

  return ast;
}

export function getTypeAST(type: string) {
  const TypeAliasName = '_T';
  const code = `type ${TypeAliasName} = ${type};`;
  const ast = babelParser.parse(code);

  let tsType: babelTypes.TSType = {
    type: 'TSAnyKeyword',
  };

  traverse(ast, {
    TSTypeAliasDeclaration(path) {
      if (path.node.id && path.node.id.name === TypeAliasName) {
        tsType = path.node.typeAnnotation;
      }
    },
  });

  return tsType as babelTypes.TSType;
}

export function getAPIPropAST(code: string, name) {
  const templateAPICode = `namespace nasl.ui {
    export class Test extends ViewComponent {
      ${code}

      constructor(options?: Partial<TestOptions>) {
        super();
      }
    }
  }`;

  const ast = babelParser.parse(templateAPICode);

  let propAST: any = null;
  traverse(ast, {
    ClassProperty(path) {
      if ((
        path.node.key.type === 'Identifier' && path.node.key.name === name
      ) || (
        path.node.key.type === 'StringLiteral' && path.node.key.value === name
      )) {
        propAST = path.node;
      }
    },
    ClassMethod(path) {
      if (path.node.key.type === 'Identifier' && path.node.key.name === name) {
        propAST = path.node;
      }
    },
  });

  return propAST;
}
