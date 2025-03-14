export type NType = NBasicType | NArrayType | NStructType | NMapType | NUnionType | NFunctionType | NUnknowType;

export interface NBasicType {
  type: 'string' | 'integer' | 'date' | 'time' | 'datetime' | 'decimal' | 'boolean' | 'any' | 'array' | 'struct' | 'map' | 'union' | 'function' | 'unknow';
}
export interface NArrayType extends NBasicType {
  type: 'array';
  value: NType;
}
export interface NStructType extends NBasicType {
  type: 'struct';
  value: Array<{
      name: string;
      type: NType;
  }>;
}
export interface NMapType extends NBasicType {
  type: 'map';
  key: NType;
  value: NType;
}
export interface NUnionType extends NBasicType {
  type: 'union';
  value: NType[];
}

export interface NFunctionParam {
  name: string;
  description?: string;
  type: NType;
  defaultValue?: string;
}

export interface NFunctionType extends NBasicType {
  type: 'function';
  params: Array<NFunctionParam>;
  returnType: NType | 'void';
}

export interface NUnknowType extends NBasicType {
  type: 'unknow';
  raw: string;
}

export type TypeMap = {
  prop: {
    [key: string]: NType;
  },
  event: {
    [key: string]: NType;
  },
  slot: {
    [key: string]: NType | null;
  },
  method: {
    [key: string]: {
      params: NFunctionParam[],
      returnType: NType | 'void',
    };
  },
  readableProp: {
    [key: string]: NType;
  },
};