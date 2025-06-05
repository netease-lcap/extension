export type FrameworkType = 'vue2' | 'vue3' | 'react';

export interface MaterialParseOptions {
  /** npm 包名 */
  name: string;
  /** npm 版本 */
  version?: string;
  /** 临时目录 */
  tempDir?: string;
  /** NPM client */
  npmClient?: string;
  /** 是否为本地包 */
  isLocal?: boolean;
  /** 本地包路径 */
  file?: string;
}

export interface MaterialScanMeta {
  /** 当前包名 */
  pkgName: string;
  /** 当前包版本 */
  pkgVersion: string;
  /** 包描述 */
  description?: string;
  /** 框架 */
  framework: FrameworkType | 'unknow';
  /** 框架版本 */
  frameworkVersion?: string;
  /** 样式文件 */
  style?: string;
  /** cwd 目录 */
  workDir: string;
  /** npm 包目录 */
  moduleDir: string;
  /** main文件相对路径 */
  mainFilePath: string;
  /** module文件相对路径 */
  moduleFilePath?: string;
  /** typings文件相对路径 */
  typingsFilePath?: string;
  /** main文件绝对路径 */
  mainFileAbsolutePath: string;
  /** module文件绝对路径 */
  moduleFileAbsolutePath?: string;
  /** typings文件绝对路径 */
  typingsFileAbsolutePath?: string;
  /** web-type.json */
  webTypeFileAbsolutePath?: string;
  /** vetur/tag.json */
  veturTagFileAbsolutePath?: string;
  /** vetur/attributes.json */
  veturAttributesFileAbsolutePath?: string;
  /** npm 客户端 */
  npmClient?: string;
}

export type McType =
  | McBasicType
  | McArrayType
  | McStructType
  | McMapType
  | McUnionType
  | McFunctionType;

export interface McBasicType {
  type:
    | 'string'
    | 'number'
    | 'boolean'
    | 'any'
    | 'array'
    | 'struct'
    | 'map'
    | 'union'
    | 'function';
  isRequired?: boolean;
}

export interface McArrayType extends McBasicType {
  type: 'array';
  value: McType;
}

export interface McStructType extends McBasicType {
  type: 'struct';
  value: Array<{ name: string; type: McType }>;
}

export interface McMapType extends McBasicType {
  type: 'map';
  value: McType;
}

export interface McUnionType extends McBasicType {
  type: 'union';
  value: (McType | string)[];
}

export interface McFunctionType extends McBasicType {
  type: 'function';
  params: Array<{ name: string; description?: string; type: McType }>;
  returnType: McType | 'void';
}

export interface MaterialComponentAttr {
  name: string;
  description: string;
  type: McType;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string;
  sync?: boolean;
}

export interface MaterialComponentEvent {
  name: string; // 事件 onClick
  description: string; //
  params: Array<{ name: string; description?: string; type: McType }>;
}

export interface MaterialComponentSlot {
  name: string; // 事件 onClick
  description: string; //
  params: Array<{ name: string; description?: string; type: McType }>;
}

export interface MaterialComponentMethod {
  name: string; // 事件 onClick
  description: string; //
  params: Array<{ name: string; description?: string; type: McType }>;
  returnType?: McType;
}

export interface MaterialComponent {
  importPath?: string;
  name: string;
  exportName?: string;
  subName?: string;
  description: string;
  attrs: MaterialComponentAttr[];
  events: MaterialComponentEvent[];
  slots: MaterialComponentSlot[];
  methods: MaterialComponentMethod[];
}

export interface MaterialSchema {
  name: string;
  version: string;
  description: string;
  framework: FrameworkType | 'unknow';
  frameworkVersion?: string;
  style?: string;
  components: MaterialComponent[];
}
