/**
 * @deprecated
 */
export const ensureHex = (str: string, length: number) => {
  if (!/^[0-9a-fA-F]+$/.test(str) || str.length !== 24) {
    let result = '';
    for (let i = 0; i < str.length; i += 1) {
      result += str.charCodeAt(i).toString(16);
    }
    result = result.padStart(length, '0');
    return result.substring(result.length - length);
  }
  return str;
};
