import { camelCase } from 'lodash';
import { visit } from 'recast';
import { McType } from '../../types/parse';
import { safeEval } from '../../utils/eval';
import { Type } from './types';
import buildParser from '../js/babel-parser';
import { debug } from '../../utils/debug';
import {
  Identifier,
  TSLiteralType,
  TSType,
  TSTypeReference,
} from '@babel/types';

const log = debug.extend('parse:tstype');

export function normalizeName(name: string) {
  if (!name) {
    return '';
  }
  if (name.includes('-')) {
    return camelCase(name);
  }

  return name;
}

function trnasformTSLiteralType(type: TSLiteralType): string {
  switch (type.literal.type) {
    case 'UnaryExpression':
      return '';
    case 'TemplateLiteral':
      return JSON.stringify(type.literal.quasis[0].value.raw);

    default:
      return JSON.stringify(type.literal.value);
  }
}

function transformTsTypeReference(type: TSTypeReference): McType {
  if (type.typeName.type === 'TSQualifiedName') {
    return {
      type: 'any',
    };
  }

  const typeName = type.typeName.name;
  switch (typeName) {
    case 'String':
      return {
        type: 'string',
      };
    case 'Number':
      return {
        type: 'number',
      };
    case 'Boolean':
      return {
        type: 'boolean',
      };
    case 'Function':
      return {
        type: 'function',
        params: [],
      };
    case 'Promise':
      if (
        type.typeParameters &&
        type.typeParameters.type === 'TSTypeParameterInstantiation' &&
        type.typeParameters.params.length > 0
      ) {
        return transformTsType(type.typeParameters.params[0]);
      }
    default:
      return {
        type: 'any',
      };
  }
}

function transformTsType(type: TSType): McType {
  switch (type.type) {
    case 'TSBigIntKeyword':
    case 'TSNumberKeyword':
      return {
        type: 'number',
      };
    case 'TSBooleanKeyword':
      return {
        type: 'boolean',
      };
    case 'TSStringKeyword':
      return {
        type: 'string',
      };
    case 'TSArrayType':
      return {
        type: 'array',
        value: transformTsType(type.elementType),
      };
    case 'TSFunctionType':
      return {
        type: 'function',
        params: type.parameters
          .filter((t) => t.type === 'Identifier')
          .map((t) => {
            return {
              name: t.name,
              type: transformTsType(
                (t.typeAnnotation as any).typeAnnotation as TSType,
              ),
            };
          }),
        returnType:
          type.typeAnnotation && type.typeAnnotation.typeAnnotation
            ? transformTsType(type.typeAnnotation.typeAnnotation)
            : undefined,
      };
    case 'TSTypeLiteral':
      return {
        type: 'struct',
        value: type.members
          .filter(
            (m) =>
              m.type === 'TSPropertySignature' && m.key.type === 'Identifier',
          )
          .map((m: any) => {
            return {
              name: (m.key as Identifier).name,
              type: transformTsType(
                (m.typeAnnotation as any).typeAnnotation as TSType,
              ),
            };
          }),
      };
    case 'TSLiteralType':
      return trnasformTSLiteralType(type) as any;
    case 'TSUnionType':
      return {
        type: 'union',
        value: type.types.map((t) => transformTsType(t)),
      };
    case 'TSTypeReference':
      return transformTsTypeReference(type);
    default:
      return {
        type: 'any',
      } as McType;
  }
}

function parseType(type: string) {
  const TypeAliasName = '_T';
  const code = `type ${TypeAliasName} = ${type};`;
  try {
    const { parse } = buildParser({ plugins: ['typescript'] });
    const ast = parse(code);

    let type;
    visit(ast, {
      visitTSTypeAliasDeclaration(path) {
        if (path.node.id && path.node.id.name === TypeAliasName) {
          type = path.node.typeAnnotation;
        }

        return false;
      },
    });

    if (!type) {
      return {
        type: 'any',
      } as McType;
    }

    return transformTsType(type);
  } catch (e) {
    log(code, e);
    return {
      type: 'any',
    } as McType;
  }
}

function normalizeType(type: Type): string[] {
  if (Array.isArray(type)) {
    return type.map((t) => normalizeType(t)).flat();
  }

  if (typeof type === 'object') {
    return [type.expression || 'any'];
  }

  return [type];
}

export function transformType(type: Type | undefined): McType {
  if (typeof type === 'undefined') {
    return {
      type: 'any',
    };
  }

  const types = normalizeType(type).map((t) => parseType(t));

  if (types.length === 0) {
    return {
      type: 'any',
    };
  }

  if (types.length === 1) {
    return types[0];
  }

  return {
    type: 'union',
    value: types,
  } as McType;
}

export function normalizeDefaultValue(value) {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.stringify(safeEval(value));
  } catch (e) {
    return undefined;
  }
}
