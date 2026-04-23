/**
 * Parses a value that might be a stringified JSON array or a single string
 * into a proper array. Useful for multipart/form-data requests.
 * @param {any} val - The value to parse
 * @returns {Array} - Always returns an array
 */
const parseJsonIfString = (val) => {
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      return [val];
    }
  }
  
  // Handle nested stringified JSON in array (common with some frontend libraries/multer)
  if (Array.isArray(val) && val.length === 1 && typeof val[0] === 'string' && val[0].trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(val[0]);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {}
  }
  
  if (Array.isArray(val)) return val;
  if (val) return [val];
  return [];
};

module.exports = { parseJsonIfString };
