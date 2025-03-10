import type { ViewComponentDeclaration } from '@nasl/types/nasl.ui.ast.d.ts';

export interface NaslComponent extends Omit<ViewComponentDeclaration, 'children'> {
  ideusage: Record<string, any>;
  extends?: any;
  order?: number;
  type?: 'pc' | 'h5' | 'both';
  sourceName?: string;
  children?: NaslComponent[];
  isChild?: boolean;
}

export interface APIEditorBaseOptions {
  type: 'add' | 'update' | 'remove' | 'order';
  module: 'info' | 'subComponent' | 'prop' | 'event' | 'slot' | 'method' | 'readableProp';
  name: string;
}

export interface APIUpdateInfoOptions extends APIEditorBaseOptions {
  type: 'update';
  module: 'info';
  data: Record<string, any>;
}

export interface APIAddSubComponentOptions extends APIEditorBaseOptions {
  type: 'add',
  module: 'subComponent',
  data: {
    name?: string;
    sourceName?: string;
    title?: string;
    description?: string;
    type?: any;
  }
}

export interface APIRemoveSubComponentOptions extends APIEditorBaseOptions {
  type: 'remove',
  module: 'subComponent',
  data: {
    name: string;
  },
}

export interface APIAddPropOptions extends APIEditorBaseOptions {
  type: 'add',
  module: 'prop',
  data: {
    name: string; // 属性名称
    group?: string; // 属性分组
    schema?: any;
  }
}


export interface APIAddEventOptions extends APIEditorBaseOptions {
  type: 'add',
  module: 'event',
  data: {
    name: string; // 属性名称
    schema?: any;
  }
}


export interface APIAddSlotOptions extends APIEditorBaseOptions {
  type: 'add',
  module: 'slot',
  data: {
    name: string; // 属性名称
    schema?: any;
  }
}


export interface APIAddReadablePropOptions extends APIEditorBaseOptions {
  type: 'add',
  module: 'readableProp',
  data: {
    name: string; // 属性名称
  },
}

export interface APIAddMethodOptions extends APIEditorBaseOptions {
  type: 'add',
  module: 'method',
  data: {
    name: string; // 属性名称
    schema?: any;
  }
}

export interface APIUpdatePropOptions extends APIEditorBaseOptions {
  type: 'update',
  module: 'prop' | 'event' | 'slot' | 'readableProp' | 'method',
  propName: string;
  data: {
    name?: string;
    tsType?: string; // any;
    defaultValue?: string; // any;
    [key: string]: any;
  };
}

export interface APIRemovePropOptions extends APIEditorBaseOptions {
  type: 'remove',
  module: 'prop' | 'event' | 'slot' | 'readableProp' | 'method',
  propName: string;
}

export interface APIOrderPropOptions extends APIEditorBaseOptions {
  type: 'order',
  data: {
    names: string[];
    isOptions?: boolean;
  }
}

export type APIUpdateOptions = APIUpdateInfoOptions
  | APIAddSubComponentOptions | APIRemoveSubComponentOptions
  | APIAddPropOptions | APIUpdatePropOptions
  | APIRemovePropOptions | APIAddEventOptions
  | APIAddSlotOptions | APIAddReadablePropOptions
  | APIAddMethodOptions | APIOrderPropOptions;
