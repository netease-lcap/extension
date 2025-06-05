import { useCallback, ChangeEvent, HTMLAttributes, useMemo } from 'react';
import { Select, Input, Button } from 'antd';
import classNames from 'classnames';
import { TypeList } from './constants';
import styles from './index.module.less';
import { NType, NArrayType, NStructType, NMapType, NUnionType, NFunctionType, NUnknowType } from '../../types';
import { IconAdd, IconTrash } from '../icons';
export interface NTypeInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: NType;
  disabledType?: (type: NType['type']) => boolean;
  onChange: (value: NType) => void;
}

const anyType = () => ({
  type: 'any',
} as NType);

export const NMapTypeInput = ({ value, onKeyChange, onValueChange }: { value: NMapType, onKeyChange: (value: NType) => void, onValueChange: (value: NType) => void }) => {
  const disabledType = useCallback((type: NType['type']) => {
    return !['string', 'integer', 'decimal', 'boolean'].includes(type);
  }, []);
  return (
    <div className={styles.subTypeInput}>
      <div className={styles.subTypeItem}>
        <span className={styles.subTypeItemLabel}>Key</span>
        <NTypeInput className={styles.subTypeItemInput} disabledType={disabledType} value={value.key} onChange={onKeyChange} />
      </div>
      <div className={styles.subTypeItem}>
        <span className={styles.subTypeItemLabel}>Value</span>
        <NTypeInput className={styles.subTypeItemInput} value={value.value} onChange={onValueChange} />
      </div>
    </div>
  );
}

export const NUnionTypeInput = ({ value, onChange }: { value: NUnionType, onChange: (value: NUnionType['value']) => void }) => {
  const handleAdd = useCallback(() => {
    onChange([...value.value, anyType()]);
  }, [value, onChange]);

  const handleRemove = useCallback((index: number) => {
    onChange(value.value.filter((_, i) => i !== index));
  }, [value, onChange]);

  const handleChange = useCallback((index: number, v: NType) => {
    onChange(value.value.map((item, i) => i === index ? v : item));
  }, [value, onChange]);
  return (
    <div className={styles.subTypeInput}>
      {value.value.map((item, index) => (
        <div className={styles.subTypeItem} key={index}>
          <NTypeInput className={styles.subTypeItemInput} value={item} onChange={(v) => handleChange(index, v)} />
          {
            value.value.length > 1 && (
              <Button onClick={() => handleRemove(index)}>
                <IconTrash />
              </Button>
            )
          }
        </div>
      ))}
      <Button color="primary" block variant="outlined" onClick={handleAdd}>
        <IconAdd />
        <span>添加</span>
      </Button>
    </div>
  );
}

export const NStructTypeInput = ({ value, onChange }: { value: NStructType, onChange: (value: NStructType['value']) => void }) => {
  const handleAdd = useCallback(() => {
    onChange([...value.value, { name: `property${value.value.length + 1}`, type: anyType() }]);
  }, [value, onChange]);

  const handleRemove = useCallback((index: number) => {
    onChange(value.value.filter((_, i) => i !== index));
  }, [value, onChange]);

  const handleChange = useCallback((index: number, v: { name: string, type: NType }) => {
    onChange(value.value.map((item, i) => i === index ? v : item));
  }, [value, onChange]);

  return (
    <div className={styles.subTypeInput}>
      {value.value.map((item, index) => (
        <div className={styles.subTypeItem} key={index}>
          <Input style={{ width: 80, height: 28, flexShrink: 0 }} value={item.name} onChange={(e) => handleChange(index, { ...item, name: e.target.value })} />
          <NTypeInput className={styles.subTypeItemInput} value={item.type} onChange={(v) => handleChange(index, { ...item, type: v })} />
          <Button onClick={() => handleRemove(index)}>
            <IconTrash />
          </Button>
        </div>
      ))}
      <Button color="primary" block variant="outlined" onClick={handleAdd}>
        <IconAdd />
        <span>添加</span>
      </Button>
    </div>
  );
}

export const NFunctionTypeInput = ({ value, onParamsChange, onReturnTypeChange }: { value: NFunctionType, onParamsChange: (value: NFunctionType['params']) => void, onReturnTypeChange: (value: NType | 'void') => void }) => {
  const handleChangeParams = useCallback((index: number, v: { name: string, type: NType }) => {
    onParamsChange(value.params.map((item, i) => i === index ? v : item));
  }, [value, onParamsChange]);

  const handleAddParams = useCallback(() => {
    onParamsChange([...value.params, { name: `param${value.params.length + 1}`, type: anyType() }]);
  }, [value, onParamsChange]);

  const handleRemoveParams = useCallback((index: number) => {
    onParamsChange(value.params.filter((_, i) => i !== index));
  }, [value, onParamsChange]);

  return (
    <div className={styles.subTypeInput}>
      <div className={styles.subTypeItem}>
        <span className={styles.subTypeItemLabel} style={{ width: 60 }}>Params</span>
        <div className={styles.subTypeItemContent}>
          {value.params.map((item, index) => (
            <div className={styles.subTypeItem} key={index}>
              <Input style={{ width: 80, height: 28, flexShrink: 0 }} value={item.name} onChange={(e) => handleChangeParams(index, { ...item, name: e.target.value })} />
              <NTypeInput value={item.type} onChange={(v) => handleChangeParams(index, { ...item, type: v })} />
              <Button onClick={() => handleRemoveParams(index)}>
                <IconTrash />
              </Button>
            </div>
          ))}
          <Button color="primary" block variant="outlined" onClick={handleAddParams}>
            <IconAdd />
            <span>添加</span>
          </Button>
        </div>
      </div>
      <div className={styles.subTypeItem}>
        <span className={styles.subTypeItemLabel} style={{ width: 60 }}>Return</span>
        {
          value.returnType && value.returnType !== 'void' && <NTypeInput value={value.returnType} onChange={onReturnTypeChange} />
        }
        {
          !value.returnType || value.returnType === 'void' ? (
            <Button onClick={() => onReturnTypeChange(anyType())}>设置返回值类型</Button>
          ) : (
            <Button onClick={() => onReturnTypeChange('void')}>
              <IconTrash />
            </Button>
          )
        }
      </div>
    </div>
  )
}

export const NTypeInput = ({ value, onChange, disabledType, className = '', style = {}, ...rest }: NTypeInputProps) => {
  const rootClassName = useMemo(() => {
    return classNames(styles.typeInput, className);
  }, [className]);

  const handleChangeType = useCallback((type: NType['type']) => {
    const typeAST: NType = {
      type,
    }
    switch (typeAST.type) {
      case 'array':
        (typeAST as NArrayType).value = anyType();
        break;
      case 'struct':
        (typeAST as NStructType).value = [];
        break;
      case 'map':
        (typeAST as NMapType).key = {
          type: 'string',
        };
        (typeAST as NMapType).value = anyType();
        break;
      case 'union':
        (typeAST as NUnionType).value = [{ type: 'string' }, anyType()];
        break;
      case 'function':
        (typeAST as NFunctionType).params = [];
        (typeAST as NFunctionType).returnType = 'void';
        break;
      case 'unknow':
        (typeAST as NUnknowType).raw = '';
        break;
      default: break;
    }

    onChange(typeAST);
  }, [onChange]);

  const handeChangeArrayTypeValue = useCallback((value: NType) => {
    const typeAST: NType = {
      type: 'array',
      value,
    }
    onChange(typeAST);
  }, [onChange]);

  const handleChangeUnknowTypeRaw = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const typeAST: NType = {
      type: 'unknow',
      raw: e.target.value,
    }
    onChange(typeAST);
  }, [onChange]);

  const handleChangeMapTypeKey = useCallback((v: NType) => {
    const typeAST: NType = {
      ...value,
      type: 'map',
      key: v,
    }
    onChange(typeAST);
  }, [value, onChange]);

  const handleChangeMapTypeValue = useCallback((v: NType) => {
    const typeAST: NType = {
      ...value,
      type: 'map',
      value: v,
    }
    onChange(typeAST);
  }, [value, onChange]);

  const handleChangeUnionTypeValue = useCallback((v: NType[]) => {
    const typeAST: NType = {
      type: 'union',
      value: v,
    };

    onChange(typeAST);
  }, [onChange]);

  const handleChangeStructTypeValue = useCallback((v: { name: string, type: NType }[]) => {
    const typeAST: NType = {
      type: 'struct',
      value: v,
    };
    onChange(typeAST);
  }, [onChange]);

  const handleChangeFunctionTypeParams = useCallback((v: { name: string, type: NType }[]) => {
    const typeAST: NType = {
      ...value,
      type: 'function',
      params: v,
    };
    onChange(typeAST);
  }, [value, onChange]);

  const handleChangeFunctionTypeReturnType = useCallback((v: NType | 'void') => {
    const typeAST: NType = {
      ...value,
      type: 'function',
      returnType: v,
    };
    onChange(typeAST);
  }, [value, onChange]);

  const typeList = useMemo(() => {
    return TypeList.filter((item) => {
      if (disabledType) {
        return !disabledType(item.value);
      }
      return true;
    });
  }, [disabledType]);

  return (
    <div  {...rest} className={rootClassName} style={style}>
      <Select options={typeList} value={value.type} onChange={handleChangeType} />
      {
        value.type === 'array' && (
          <div className={styles.subTypeInput}>
            <NTypeInput value={(value as NArrayType).value} onChange={handeChangeArrayTypeValue} />
          </div>
        )
      }
      {
        value.type === 'unknow' && (
          <div className={styles.subTypeInput}>
            <Input value={(value as NUnknowType).raw} onChange={handleChangeUnknowTypeRaw} />
          </div>
        )
      }
      {
        value.type === 'map' && (
          <NMapTypeInput value={value as NMapType} onKeyChange={handleChangeMapTypeKey} onValueChange={handleChangeMapTypeValue} />
        )
      }
      {
        value.type === 'union' && (
          <NUnionTypeInput value={value as NUnionType} onChange={handleChangeUnionTypeValue} />
        )
      }
      {
        value.type === 'struct' && (
          <NStructTypeInput value={value as NStructType} onChange={handleChangeStructTypeValue} />
        )
      }
      {
        value.type === 'function' && (
          <NFunctionTypeInput value={value as NFunctionType} onParamsChange={handleChangeFunctionTypeParams} onReturnTypeChange={handleChangeFunctionTypeReturnType} />
        )
      }
    </div>
  );
};
