import { useCallback, useEffect, useMemo, useState } from 'react';
import { Flex, Form, Input, Button } from 'antd';
import { LogicDeclaration } from '@nasl/types/nasl.ui.ast';
import { useComponentContext } from '../../../hooks';
import { IconAdd, IconTrash } from '../../icons';
import { NFunctionParam, NType, TypeMap } from '../../../types';
import { transformNType } from '../../../utils/transform';
import { NTypeSetter } from '../../NTypeSetter';
import styles from './index.module.css';
export interface MethodFormProps {
  methodData: LogicDeclaration;
}

function genParamTsCode(param: NFunctionParam) {
  let decorator = '';
  if (param.description && param.description !== param.name) {
    decorator = `@Param({ description: ${JSON.stringify(param.description)}, title: ${JSON.stringify(param.description)} })`;
  }

  return `${decorator}${param.name}: ${transformNType(param.type)}${param.defaultValue ? ` = ${param.defaultValue}` : ''}`;
}

function genTsType(ast: TypeMap['method'][string]) {
  return `function (${ast.params.map((param) => genParamTsCode(param)).join(', ')}): ${!ast.returnType || ast.returnType === 'void' ? 'void' : transformNType(ast.returnType)} {}`;
}

const useMethodTypeAST = (name: string) => {
  const { component, updateComponent } = useComponentContext();
  const [typeAST, setTypeAST] = useState<TypeMap['method'][string]>({ params: [], returnType: 'void' });

  useEffect(() => {
    const ast = component?.typeMap.method[name];
    if (ast && JSON.stringify(ast) !== JSON.stringify(typeAST)) {
      setTypeAST(ast);
    }
  }, [component?.typeMap.method[name]]);

  const requestUpdateTsType = useCallback((ast: TypeMap['method'][string], requestUpdate = true) => {
    setTypeAST(ast);
    if (!component?.name || !requestUpdate) {
      return;
    }

    updateComponent({
      type: 'update',
      module: 'method',
      name: component.name,
      propName: name,
      data: {
        tsType: genTsType(ast),
      },
    });
  }, [updateComponent, component?.name, name]);

  const handleChangeReturnType = useCallback((returnType: NType | 'void') => {
    const ast = { ...typeAST, returnType };
    requestUpdateTsType(ast);
  }, [typeAST, requestUpdateTsType]);

  const handleAddParam = useCallback(() => {
    const ast = { ...typeAST, params: [...typeAST.params, { name: `params${typeAST.params.length + 1}`, type: { type: 'any' } }] } as TypeMap['method'][string];
    requestUpdateTsType(ast);
  }, [typeAST, requestUpdateTsType]);

  const handleChangeParam = useCallback((index: number, param: NFunctionParam, requestUpdate: boolean = true) => {
    const ast = { ...typeAST, params: [...typeAST.params.slice(0, index), param, ...typeAST.params.slice(index + 1)] } as TypeMap['method'][string];
    requestUpdateTsType(ast, requestUpdate);
  }, [typeAST, requestUpdateTsType]);

  const handleRemoveParam = useCallback((index: number) => {
    const ast = { ...typeAST, params: typeAST.params.filter((_, i) => i !== index) } as TypeMap['method'][string];
    requestUpdateTsType(ast);
  }, [typeAST, requestUpdateTsType]);

  return [typeAST, {
    updateReturnType: handleChangeReturnType,
    addParam: handleAddParam,
    updateParam: handleChangeParam,
    handleRemoveParam,
  }] as [TypeMap['method'][string], {
    updateReturnType: (returnType: NType | 'void') => void,
    addParam: () => void,
    updateParam: (index: number, param: NFunctionParam, requestUpdate?: boolean) => void,
    handleRemoveParam: (index: number) => void,
  }];
}

export const MethodForm = ({ methodData }: MethodFormProps) => {
  const [form] = Form.useForm();
  const { updateComponent, component } = useComponentContext();
  const [typeAST, typeASTActions] = useMethodTypeAST(methodData.name);

  useEffect(() => {
    form.setFieldsValue(methodData);
  }, [form, methodData]);

  const handleRequestChange = useCallback((name: keyof LogicDeclaration, value: any) => {
    if (!component?.name || methodData[name] === value) {
      return;
    }

    updateComponent({
      type: 'update',
      module: 'method',
      name: component.name,
      propName: methodData.name,
      data: {
        [name]: value,
      },
    });
  }, [methodData, component?.name, updateComponent]);

  const handleMap: Record<string, () => void> = useMemo(() => {
    return [
      'title',
      'description',
    ].reduce((acc, key) => {
      return {
        ...acc,
        [key]: () => {
          handleRequestChange(key as keyof LogicDeclaration, form.getFieldValue(key));
        },
      }
    }, {} as Record<keyof LogicDeclaration, () => void>);
  }, [form, handleRequestChange]);

  const hasReturnType = typeAST.returnType && typeAST.returnType !== 'void';

  return (
    <Form form={form} layout="vertical" colon={false}>
      <Form.Item name="title" label="标题">
        <Input onBlur={handleMap.title} />
      </Form.Item>
      <Form.Item name="description" label="描述">
        <Input onBlur={handleMap.description} />
      </Form.Item>
      <Form.Item label="参数">
        <Flex vertical gap={12} align="stretch">
          {
            typeAST.params.map((param, index) => (
              <Flex vertical align="stretch" gap={8} className={styles.paramItem}>
                <Flex align="center" gap={8}>
                  <span className={styles.paramLabel}>参数名</span>
                  <Input
                    placeholder="参数名"
                    style={{ flex: 1 }}
                    value={param.name}
                    onChange={(e) => typeASTActions.updateParam(index, { ...param, name: e.target.value }, false)}
                    onBlur={() => typeASTActions.updateParam(index, { ...param })}
                  />
                  <Button className={styles.removeButton} onClick={() => typeASTActions.handleRemoveParam(index)}>
                    <IconTrash />
                  </Button>
                </Flex>
                <Flex align="center" gap={8}>
                  <span className={styles.paramLabel}>类型</span>
                  <NTypeSetter type={param.type as NType} style={{ flex: 1 }} onChange={(type) => typeASTActions.updateParam(index, { ...param, type })} />
                </Flex>
                <Flex align="center" gap={8}>
                  <span className={styles.paramLabel}>默认值</span>
                  <Input
                    placeholder="默认值"
                    style={{ flex: 1 }}
                    value={param.defaultValue}
                    onChange={(e) => typeASTActions.updateParam(index, { ...param, defaultValue: e.target.value }, false)}
                    onBlur={() => typeASTActions.updateParam(index, { ...param })}
                  />
                </Flex>
              </Flex>
            ))
          }
          <Button onClick={typeASTActions.addParam}>
            <IconAdd />
            <span>添加参数</span>
          </Button>
        </Flex>
      </Form.Item>
      <Form.Item label={hasReturnType ? '返回值类型' : null}>
        {
          hasReturnType && (
            <Flex align="center" gap={8}>
              <NTypeSetter type={typeAST.returnType as NType} style={{ flex: 1 }} onChange={typeASTActions.updateReturnType} />
              <Button onClick={() => typeASTActions.updateReturnType('void')}>
                <IconTrash />
              </Button>
            </Flex>
          )
        }
        {
          !hasReturnType && (
            <Button color="primary" variant="text" onClick={() => typeASTActions.updateReturnType({ type: 'any' })}>设置返回值类型</Button>
          )
        }
      </Form.Item>
    </Form>
  );
}
