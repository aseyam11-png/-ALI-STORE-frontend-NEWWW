module.exports = {
  id: "ali-store",
  viewports: [
    { label: "desktop", width: 1440, height: 900 },
    { label: "tablet", width: 768, height: 1024 },
    { label: "mobile", width: 390, height: 844 },
  ],
  scenarios: [
    {
      label: "homepage",
      url: "http://127.0.0.1:3000/",
      delay: 1500,
      misMatchThreshold: 0.1,
      readySelector: "body",
    },
  ],
  paths: {
    bitmaps_reference: "backstop_data/bitmaps_reference",
    bitmaps_test: "backstop_data/bitmaps_test",
    engine_scripts: "backstop_data/engine_scripts",
    html_report: "backstop_data/html_report",
    ci_report: "backstop_data/ci_report",
  },
  engine: "playwright",
  engineOptions: {
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  },
  report: ["browser", "CI"],
  debug: false,
  debugWindow: false,
};
