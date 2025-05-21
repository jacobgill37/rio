/// <reference path="./.sst/platform/config.d.ts" />

const region = "europe-west2";
const projectId = "rio-api-459110";

export default $config({
  app(input) {
    return {
      name: "rio",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "local",
      providers: { gcp: { version: "8.29.0", region: region } },
    };
  },
  async run() {
    new gcp.artifactregistry.Repository("rio-repo", {
      project: projectId,
      location: region,
      repositoryId: "rio-repo",
      format: "DOCKER",
      description: "Rio Docker repository",
    });
    new gcp.cloudrun.Service("default", {
      name: "cloudrun-srv",
      project: projectId,
      location: region,
      template: {
        spec: {
          containers: [
            {
              image: "us-docker.pkg.dev/cloudrun/container/hello",
            },
          ],
        },
      },
      traffics: [
        {
          percent: 100,
          latestRevision: true,
        },
      ],
    });
  },
});
