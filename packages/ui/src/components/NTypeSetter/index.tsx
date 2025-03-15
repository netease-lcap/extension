import { HTMLAttributes, useCallback, useEffect, useMemo, useState } from 'react';
import { Input, Button, Popconfirm } from 'antd';
import { cloneDeep } from 'lodash';
import { NTypeInput } from './NTypeInput';
import { NType } from '../../types';
import classNames from 'classnames';
import { SettingOutlined } from '@ant-design/icons';
import { transformNType } from '../../utils/transform';
import styles from './index.module.less';

export interface NTypeSetterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  type?: NType,
  onChange?: (type: NType) => void;
  disabledType?: (type: NType['type']) => boolean;
}

export const NTypeSetter = ({ type, onChange = () => {}, className = '', style = {}, disabledType, ...rest }: NTypeSetterProps) => {
  const rootClassName = useMemo(() => {
    return classNames(styles.typeSetter, className);
  }, [className]);
  const [typeAST, setTypeAST] = useState<NType>({ type: 'any' });

  const tsType = useMemo(() => {
    if (!type) {
      return '';
    }

    return transformNType(type);
  }, [type]);

  const settedType = useMemo(() => {
    return transformNType(typeAST);
  }, [typeAST]);

  const handleConfirm = useCallback(() => {
    onChange(typeAST);
  }, [onChange, typeAST]);

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      setTypeAST(type ? cloneDeep(type) : { type: 'any' });
    }
  }, [type]);

  useEffect(() => {
    setTypeAST(type ? cloneDeep(type) : { type: 'any' });
  }, [type]);

  return (
    <div className={rootClassName} style={style} {...rest}>
      <Input className={styles.input} readOnly value={tsType} />
      <Popconfirm
        title="设置类型"
        icon={null}
        description={(
          <div className={styles.typeSetterContent}>
            <div className={styles.typePreview}>
              <span>{settedType}</span>
            </div>
            <NTypeInput value={typeAST} onChange={setTypeAST} disabledType={disabledType} />
          </div>
        )}
        onOpenChange={handleOpenChange}
        placement="bottomRight"
        onConfirm={handleConfirm}
      >
        <Button className={styles.action}>
          <SettingOutlined style={{ width: 16, height: 16, justifyContent: 'center' }} />
        </Button>
      </Popconfirm>
    </div>
  );
};


