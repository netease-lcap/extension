export type Name = string;
/**
 * List of symbol aliases
 */
export type Aliases = string[];
/**
 * Short description to be rendered in documentation popup. It will be rendered according to description-markup setting.
 */
export type Description = string;
/**
 * Link to online documentation.
 */
export type DocUrl = string;
export type HtmlAttributeDefault = string;
export type HtmlAttributeRequired = boolean;
export type HtmlAttributeValue =
  | {
      kind: string;
    }
  | {
      kind: string;
      required?: boolean;
    }
  | {
      kind: string;
      required?: boolean;
    }
  | {
      kind: string;
      required?: boolean;
    }
  | {
      kind: string;
      items: [] | [string];
      required?: boolean;
    }
  | {
      kind: string;
      type: Type;
      required?: boolean;
    };
/**
 * Specify type according to selected language for type syntax. The type can be specified by a string expression, an object with list of imports and an expression, or an array of possible types.
 */
export type Type = string | ComplexType | (string | ComplexType)[];
/**
 * Allows to specify the source of the entity. For Vue.js component this may be for instance a class.
 */
export type Source =
  | {
      /**
       * Path to the file, relative to the web-types JSON.
       */
      file: string;
      /**
       * Offset in the file under which the source symbol, like class name, is located.
       */
      offset: number;
    }
  | {
      /**
       * Name of module, which exports the symbol. May be omitted, in which case it's assumed to be the name of the library.
       */
      module?: string;
      /**
       * Name of the exported symbol.
       */
      symbol: string;
    };
/**
 * A RegEx pattern to match whole content. Syntax should work with at least ECMA, Java and Python implementations.
 */
export type Pattern =
  | string
  | {
      regex?: string;
      'case-sensitive'?: boolean;
      [k: string]: unknown;
    };

export interface JSONSchemaForWebTypes {
  /**
   * Framework, for which the components are provided by the library
   */
  framework: 'vue';
  /**
   * Name of the library
   */
  name: string;
  /**
   * Version of the library, for which web-types are provided
   */
  version: string;
  contributions: {
    html?: Html;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
export interface Html {
  /**
   * Language in which types as specified.
   */
  'types-syntax'?: 'typescript';
  /**
   * Markup language in which descriptions are formatted
   */
  'description-markup'?: 'html' | 'markdown' | 'none';
  tags?: HtmlTag[];
  attributes?: HtmlAttribute[];
  'vue-filters'?: HtmlVueFilter[];
}

export interface HtmlTag {
  name: Name;
  aliases?: Aliases;
  description?: Description;
  'doc-url'?: DocUrl;
  attributes?: HtmlTagAttribute[];
  source?: Source;
  events?: HtmlTagEvent[];
  slots?: HtmlTagSlot[];
  /**
   * Deprecated. Use regular 'slot' property instead and specify 'vue-properties' to provide slot scope information.
   */
  'vue-scoped-slots'?: null;
  'vue-model'?: HtmlTagVueModel;
}

export interface HtmlVueElement {
  name: Name;
  source?: Source;
  description?: Description;
  'doc-url'?: string;
  props?: HtmlTagAttribute[];
  slots?: HtmlTagSlot[];
  js?: {
    events?: HtmlTagEvent[];
  };
}

export interface HtmlTagAttribute {
  name: Name;
  description?: Description;
  'doc-url'?: DocUrl;
  default?: HtmlAttributeDefault;
  required?: HtmlAttributeRequired;
  value?: HtmlAttributeValue;
  /**
   * Deprecated. Use 'value' property instead. Specify only if type is 'boolean' for compatibility with WebStorm 2019.2.
   */
  type?: Type;
  values?: { name: string }[];
  'attribute-value': {
    type: 'enum' | 'of-match';
  };
}

export interface ComplexType {
  /**
   * List of import statements required to resolve symbol in the type expression.
   */
  imports: string[];
  expression: string;
}

export interface HtmlTagEvent {
  name: Name;
  description?: Description;
  'doc-url'?: DocUrl;
  arguments?: TypedEntity[];
}

export interface TypedEntity {
  name: Name;
  description?: Description;
  'doc-url'?: DocUrl;
  type?: Type;
}

export interface HtmlTagSlot {
  name: Name;
  pattern?: Pattern;
  description?: Description;
  'doc-url'?: DocUrl;
  type?: Type;
  /**
   * Specify properties of the slot scope
   */
  'vue-properties'?: TypedEntity[];
}

export interface HtmlTagVueModel {
  prop?: string;
  event?: string;
}

export interface HtmlAttribute {
  name: Name;
  aliases?: Aliases;
  description?: Description;
  'doc-url'?: DocUrl;
  default?: HtmlAttributeDefault;
  required?: HtmlAttributeRequired;
  value?: HtmlAttributeValue;
  source?: Source;
  'vue-argument'?: HtmlAttributeVueArgument;
  'vue-modifiers'?: HtmlAttributeVueModifier[];
}
/**
 * Provide information about directive argument
 */
export interface HtmlAttributeVueArgument {
  pattern?: Pattern;
  description?: Description;
  'doc-url'?: DocUrl;
  /**
   * Whether directive requires an argument
   */
  required?: boolean;
}
export interface HtmlAttributeVueModifier {
  name: Name;
  pattern?: Pattern;
  description?: Description;
  'doc-url'?: DocUrl;
}
export interface HtmlVueFilter {
  name: Name;
  aliases?: Aliases;
  description?: Description;
  'doc-url'?: DocUrl;
  source?: Source;
  /**
   * Type of expression on the left hand-side of the pipe of operator
   */
  accepts?: string | ComplexType | (string | ComplexType)[];
  /**
   * Type of the result
   */
  returns?: string | ComplexType | (string | ComplexType)[];
  /**
   * List of arguments accepted by the filter. All arguments are non-optional by default.
   */
  arguments?: HtmlVueFilterArgument[];
}

export interface HtmlVueFilterArgument {
  name: Name;
  description?: Description;
  'doc-url'?: DocUrl;
  type?: Type;
  optional?: boolean;
}

export interface VeturTag {
  attributes: string[];
  description?: string;
}

export interface VeturTagAttribute {
  type: string;
  options?: string[];
  description?: string;
}
