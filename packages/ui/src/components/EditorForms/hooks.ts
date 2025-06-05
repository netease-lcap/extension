import { useState, useCallback, useEffect } from 'react';
import { NType } from '../../types';

export const useTypeAST = (type: NType | undefined, onChange: (type: NType) => void) => {
  const [typeAST, setTypeAST] = useState<NType>({ type: 'any' });

  const handleChangeType = useCallback((t: NType) => {
    setTypeAST(t);
    onChange(t);
  }, [onChange]);

  useEffect(() => {
    const ast = type;
    if (ast && JSON.stringify(ast) !== JSON.stringify(typeAST)) {
      setTypeAST(ast);
    }
  }, [type]);

  return [typeAST, handleChangeType] as [NType, (type: NType) => void];
}
