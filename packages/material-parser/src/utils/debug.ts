import _debug from 'debug';

export const debug = _debug('codewave:mat');
export const enableDebug = () => _debug.enable('codewave:*');
export const disableDebug = () => _debug.disable();
