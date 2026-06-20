# Azure DevOps pipeline for Playwright Workspaces

This guide shows how to run Playwright tests in Azure DevOps using Azure Playwright Workspaces.

The pipeline uses Microsoft Entra ID authentication through an Azure DevOps service connection. This is the recommended approach. You do not need `PLAYWRIGHT_SERVICE_ACCESS_TOKEN` when using this setup.

Reference:

```text
https://learn.microsoft.com/en-us/azure/app-testing/playwright-workspaces/quickstart-automate-end-to-end-testing?tabs=pipelines&pivots=playwright-test-runner
```

## Prerequisites

Before running the pipeline, make sure you have:

- An Azure Playwright Workspace.
- The Playwright Workspace browser endpoint.
- An Azure DevOps service connection with permission to access the Azure subscription/resource group.
- The required npm packages installed in this repo:

```bash
npm install -D @azure/playwright
npm install @azure/identity
```

## Pipeline variables

The pipeline uses these variables:

```yml
PLAYWRIGHT_SERVICE_URL: "wss://eastasia.api.playwright.microsoft.com/playwrightworkspaces/86bb2b02-c971-4550-879b-cb1e214766cc/browsers"
PLAYWRIGHT_WORKERS: "1"
PLAYWRIGHT_SAMPLE_USERNAME: "student"
```

For a free plan, start with:

```yml
PLAYWRIGHT_WORKERS: "1"
```

You can increase the worker count later if your workspace quota and test suite need it.

## Service connection

Update this line in the YAML:

```yml
azureSubscription: "My_Service_Connection"
```

Replace `My_Service_Connection` with the actual name of your Azure DevOps service connection.

The `AzureCLI@2` task uses that service connection to authenticate. The Playwright service config then uses:

```ts
credential: new DefaultAzureCredential()
```

from `playwright.service.config.ts`.

## Full pipeline template

```yml
trigger:
  branches:
    include:
      - main

pr:
  branches:
    include:
      - main

variables:
  PLAYWRIGHT_SERVICE_URL: "wss://eastasia.api.playwright.microsoft.com/playwrightworkspaces/86bb2b02-c971-4550-879b-cb1e214766cc/browsers"
  PLAYWRIGHT_WORKERS: "1"
  PLAYWRIGHT_SAMPLE_USERNAME: "student"

steps:
  - task: PowerShell@2
    enabled: true
    displayName: "Install dependencies"
    inputs:
      targetType: "inline"
      script: "npm ci"
      workingDirectory: "$(System.DefaultWorkingDirectory)"

  - task: AzureCLI@2
    displayName: "Run Playwright tests"
    env:
      PLAYWRIGHT_SERVICE_URL: $(PLAYWRIGHT_SERVICE_URL)
      PLAYWRIGHT_SAMPLE_USERNAME: $(PLAYWRIGHT_SAMPLE_USERNAME)
      # PLAYWRIGHT_SERVICE_ACCESS_TOKEN: $(PLAYWRIGHT_SERVICE_ACCESS_TOKEN) # Not recommended. Use Microsoft Entra ID authentication instead.
    inputs:
      azureSubscription: "My_Service_Connection" # Update this to your Azure DevOps service connection name.
      scriptType: "pscore"
      scriptLocation: "inlineScript"
      inlineScript: |
        npx playwright test -c playwright.service.config.ts --workers=$(PLAYWRIGHT_WORKERS)
      addSpnToEnvironment: true
      workingDirectory: "$(System.DefaultWorkingDirectory)"

  - task: PublishPipelineArtifact@1
    displayName: "Upload Playwright report"
    inputs:
      targetPath: "$(System.DefaultWorkingDirectory)/playwright-report"
      artifact: "Playwright tests"
      publishLocation: "pipeline"
```

## What each step does

`Install dependencies`

Installs packages from `package-lock.json` using `npm ci`.

`Run Playwright tests`

Runs the Playwright test suite through `playwright.service.config.ts`, which connects the test run to Azure Playwright Workspaces.

`Upload Playwright report`

Uploads the generated `playwright-report` folder as a pipeline artifact.

## Authentication note

This pipeline intentionally does not use:

```yml
PLAYWRIGHT_SERVICE_ACCESS_TOKEN
```

Access tokens are convenient, but they behave like long-lived secrets. Prefer Microsoft Entra ID authentication with an Azure DevOps service connection.

## Common issues

### Could not authenticate with the service

Check that:

- `azureSubscription` matches the exact Azure DevOps service connection name.
- The service connection has permission to access the Playwright Workspace.
- `addSpnToEnvironment` is set to `true`.
- `PLAYWRIGHT_SERVICE_URL` points to the correct workspace browser endpoint.

### Working directory is wrong

If the repo is checked out into a subfolder, update:

```yml
workingDirectory: "$(System.DefaultWorkingDirectory)"
```

to the folder that contains `package.json` and `playwright.service.config.ts`.

### Environment variable is undefined in CI

The local `.env` file is ignored by Git, so Azure DevOps does not receive it automatically.

For non-secret test values, define them as pipeline variables:

```yml
variables:
  PLAYWRIGHT_SAMPLE_USERNAME: "student"
```

Then pass them to the test task:

```yml
env:
  PLAYWRIGHT_SAMPLE_USERNAME: $(PLAYWRIGHT_SAMPLE_USERNAME)
```

For real secrets, store them in Azure DevOps pipeline variables marked as secret, or use a variable group.
