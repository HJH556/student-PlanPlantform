"use strict";
const common_vendor = require("../common/vendor.js");
const getBaseUrl = () => {
  if (typeof common_vendor.index !== "undefined" && common_vendor.index.getSystemInfoSync) {
    const systemInfo = common_vendor.index.getSystemInfoSync();
    if (systemInfo.platform === "devtools") {
      return "http://localhost:8000";
    } else {
      return "http://10.216.96.113:8000";
    }
  }
  return "http://localhost:8000";
};
const config = {
  baseUrl: getBaseUrl(),
  setBaseUrl(url) {
    this.baseUrl = url;
  }
};
exports.config = config;
//# sourceMappingURL=../../.sourcemap/mp-weixin/config/index.js.map
