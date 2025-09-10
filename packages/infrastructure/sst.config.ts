/// <reference path="./.sst/platform/config.d.ts" />

const region = process.env.REGION || "us-central1";
const projectId = process.env.PROJECT_ID || "rio-test-project";
const imageName =
  process.env.DOCKER_IMAGE ||
  `${region}-docker.pkg.dev/${projectId}/rio-repo/rio-image`;

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
      description: "Rio docker repository",
    });

    const cloudrun = new gcp.cloudrun.Service("cloudRun", {
      name: "rio-server",
      project: projectId,
      location: region,
      template: {
        spec: {
          containers: [
            {
              image: imageName,
              ports: [{ containerPort: 8080 }],
              resources: {
                limits: {
                  memory: "4Gi",
                  cpu: "2",
                },
              },
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

    const noAuth = gcp.organizations.getIAMPolicy({
      bindings: [
        {
          role: "roles/run.invoker",
          members: ["allUsers"],
        },
      ],
    });
    new gcp.cloudrun.IamPolicy("noAuth", {
      location: cloudrun.location,
      project: cloudrun.project,
      service: cloudrun.name,
      policyData: noAuth.then((noAuth) => noAuth.policyData),
    });
  },
});
