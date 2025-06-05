import { readFileSync } from 'fs-extra';
import { NodeVM } from 'vm2';

const parseContent = `
const react = require('react');
require('parse-prop-types');

if (react.PropTypes) {
  const T = react.PropTypes;
  const mutatePropType = (name, object = T[name]) => {
    object.type = { ...object.type, name };
    if (object.isRequired) {
      object.isRequired.required = true;
      Object.keys(object)
        .filter(key => !["isRequired"].includes(key))
        .forEach(key => {
          object.isRequired[key] = object[key];
        });
      mutatePropType(name, object.isRequired);
    }
  };

  const mutatePropTypeFn = (name) => {
    const original = T[name];
    T[name] = arg => {
      const object = original(arg);
      if (typeof arg === "function" && arg.name.indexOf("checkType") >= 0) {
        // arrayOf
        object.type = { value: parsePropTypeMethod(arg).type };
      } else if (typeof arg === "function") {
        // instanceOf
        object.type = { value: arg.name };
      } else if (Array.isArray(arg) && typeof arg[0] === "function") {
        // oneOfType
        object.type = {
          value: arg.map(method => parsePropTypeMethod(method).type)
        };
      } else if (!Array.isArray(arg) && typeof arg === "object") {
        // shape
        object.type = { value: parsePropTypes({ propTypes: arg }) };
      } else {
        // oneOf
        object.type = { value: arg };
      }
      mutatePropType(name, object);
      return object;
    };
  };

  Object.keys(T)
    .filter(type => !["exact", "checkPropTypes", "PropTypes"].includes(type))
    .forEach(type => {
      if (T[type].isRequired) {
        return mutatePropType(type);
      }
      return mutatePropTypeFn(type);
    });

  const parsePropTypeMethod = (
    { isRequired, ...method },
    value,
  ) => ({
    type: {
      name: "custom"
    },
    required: false,
    ...(typeof value !== "undefined" ? { defaultValue: { value } } : {}),
    ...method
  });
}
`;

const cssPattern = /\.(css|scss|sass|less)$/;
function requireInSandbox(filePath: string) {
  const vm = new NodeVM({
    sandbox: {},
    sourceExtensions: ['js', 'css', 'scss', 'sass', 'less'],
    compiler: (code, filename) => {
      if (filename.match(cssPattern)) {
        return `
              const handler = {
                get() {
                  return new Proxy({}, handler);
                },
              };
              const proxiedObject = new Proxy({}, handler);
              module.exports = proxiedObject;
            `;
      } else {
        return code;
      }
    },
    require: {
      external: true,
      context: 'sandbox',
    },
  });
  const fileContent = readFileSync(filePath, { encoding: 'utf8' });
  return vm.run(parseContent + fileContent, filePath);
}

export default requireInSandbox;
