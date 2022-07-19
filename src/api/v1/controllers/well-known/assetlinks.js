const assetlinks = (_req, res) =>
  res.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.ttime",
        sha256_cert_fingerprints: [],
      },
    },
  ]);

export default assetlinks;
