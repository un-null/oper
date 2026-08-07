import { defineUnlighthouseConfig } from "unlighthouse/config";

export default defineUnlighthouseConfig({
  site: "http://localhost:3000",
  scanner: {
    samples: 3,
    throttle: true,
    skipJavascript: false,
  },
  lighthouseOptions: {
    maxWaitForLoad: 45000,
  },
  puppeteerClusterOptions: {
    maxConcurrency: 1,
  },
});
