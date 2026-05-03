/**
 * Parses a value that might be a stringified JSON array or a single string
 * into a proper array. Useful for multipart/form-data requests.
 * @param {any} val - The value to parse
 * @returns {Array} - Always returns an array
 */
const parseJsonIfString = (val) => {
  let result = [];
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      result = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      result = [val];
    }
  } else if (Array.isArray(val) && val.length === 1 && typeof val[0] === 'string' && val[0].trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(val[0]);
      result = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {}
  } else if (Array.isArray(val)) {
    result = val;
  } else if (val) {
    result = [val];
  }

  // Filter out null, undefined, empty strings, or whitespace-only strings
  return result.filter(v => v !== null && v !== undefined && String(v).trim() !== "");
};

module.exports = { parseJsonIfString };
