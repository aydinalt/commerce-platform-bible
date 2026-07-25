/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: "no-cross-domain-module-imports",
      comment:
        "Domain modules communicate through application contracts/events, not direct package imports.",
      severity: "error",
      from: { path: "^modules/([^/]+)/" },
      to: {
        path: "^modules/([^/]+)/",
        pathNot: "^modules/$1/"
      }
    },
    {
      name: "shared-packages-own-no-product-domain",
      severity: "error",
      from: { path: "^packages/" },
      to: { path: "^(apps|modules)/" }
    },
    {
      name: "domain-does-not-depend-on-outer-layers",
      severity: "error",
      from: { path: "/domain/" },
      to: { path: "/(application|infrastructure|interface)/" }
    },
    {
      name: "modules-do-not-depend-on-apps",
      severity: "error",
      from: { path: "^modules/" },
      to: { path: "^apps/" }
    },
    {
      name: "no-circular-dependencies",
      severity: "error",
      from: {},
      to: { circular: true }
    }
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: "(^|/)dist/|(^|/)generated/",
    tsConfig: { fileName: "tsconfig.json" }
  }
};
