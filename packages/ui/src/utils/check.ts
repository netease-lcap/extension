export const isNaslChange = (message: string) => {
  return message.startsWith('nasl.ui building') || message.startsWith('nasl.extension building');
};

export const isCamelCase = (str: string) => str && /^[a-z][a-zA-Z]*([A-Z][a-zA-Z]*)*$/.test(str);
