const logger = {
  info: (message, meta = {}) => {
    console.log(
      `[${new Date().toISOString()}] INFO: ${message}`,
      Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : ""
    );
  },

  error: (message, meta = {}) => {
    console.error(
      `[${new Date().toISOString()}] ERROR: ${message}`,
      Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : ""
    );
  },

  warn: (message, meta = {}) => {
    console.warn(
      `[${new Date().toISOString()}] WARN: ${message}`,
      Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : ""
    );
  },

  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[${new Date().toISOString()}] DEBUG: ${message}`,
        Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : ""
      );
    }
  },
};

module.exports = logger;
