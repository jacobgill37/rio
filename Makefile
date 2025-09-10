include .env*

install:
	bun install 
	cd packages/rio-api && bun install

bun-install-api:
	cd packages/rio-api && bun install

# App commands
dev:
	cd packages/rio && bun run start-tunnel

build-dev:
	cd packages/rio && bun run build-dev

build-preview:
	cd packages/rio && bun run build-preview

# API commands
run-server:
	cd packages/rio-api && bun run src/server.ts

run-client:
	cd packages/rio-api && bun run src/client.ts

docker-run-server:
	cd packages/rio-api && docker compose up --build

docker-build-api:
	cd packages/rio-api && docker build -t ${DOCKER_IMAGE} .

docker-push:
	docker push ${DOCKER_IMAGE}

deploy-api:
	$(MAKE) docker-build-api
	$(MAKE) docker-push
	$(MAKE) sst-deploy-dev

# SST commands
sst-dev:
	cd packages/infrastructure && bun run sst dev

sst-deploy-dev:
	cd packages/infrastructure && bun run sst deploy --stage ${SST_PERSONAL_STAGE}

sst-teardown-dev:
	cd packages/infrastructure && bun run sst remove --stage ${SST_PERSONAL_STAGE}
