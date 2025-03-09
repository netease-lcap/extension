export const isNaslChange = (message: string) => {
  return message.startsWith('nasl.ui building') || message.startsWith('nasl.extension building');
};
