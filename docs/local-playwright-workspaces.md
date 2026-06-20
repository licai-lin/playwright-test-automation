# Run Playwright Workspaces tests locally

This guide explains how to run this repo's Playwright tests locally against Azure Playwright Workspaces.

The service config file is:

```bash
playwright.service.config.ts
```

Full `playwright.service.config.ts` content:

```ts
import { defineConfig } from '@playwright/test';
import { createAzurePlaywrightConfig, ServiceOS } from '@azure/playwright';
import { DefaultAzureCredential } from '@azure/identity';
import config from './playwright.config';

/* Learn more about service configuration at https://aka.ms/pww/docs/config */
export default defineConfig(
  config,
  createAzurePlaywrightConfig(config, {
    exposeNetwork: '<loopback>',
    connectTimeout: 3 * 60 * 1000, // 3 minutes
    os: ServiceOS.LINUX,
    credential: new DefaultAzureCredential(),
  })
);
```

The workspace service URL is:

```bash
wss://eastasia.api.playwright.microsoft.com/playwrightworkspaces/86bb2b02-c971-4550-879b-cb1e214766cc/browsers
```

## 1. Install dependencies

From the project root, install Node dependencies:

```bash
npm install
```

Or, if dependencies are already locked and you want a clean install:

```bash
npm ci
```

## 2. Check if Azure CLI is installed

Run:

```bash
az --version
```

If you see `zsh: command not found: az`, install Azure CLI.

## 3. Install Azure CLI on macOS

If you use Homebrew, run:

```bash
brew install azure-cli
```

Then verify:

```bash
az --version
```

## 4. Log in to Azure

Run:

```bash
az login
```

A browser window opens. Sign in with the Azure account that has access to the Playwright Workspace.

If Azure CLI asks you to select a subscription, choose the subscription that contains the Playwright Workspace. If the correct subscription is already marked with `*`, press Enter.

You can check the active subscription with:

```bash
az account show --output table
```

If needed, switch subscriptions:

```bash
az account set --subscription "<subscription name or id>"
```

## 5. Export the Playwright service URL

In the same terminal session, run:

```bash
export PLAYWRIGHT_SERVICE_URL="wss://eastasia.api.playwright.microsoft.com/playwrightworkspaces/86bb2b02-c971-4550-879b-cb1e214766cc/browsers"
```

For Bash or Zsh, do not add spaces around `=`.

Correct:

```bash
export PLAYWRIGHT_SERVICE_URL="wss://eastasia.api.playwright.microsoft.com/playwrightworkspaces/86bb2b02-c971-4550-879b-cb1e214766cc/browsers"
```

Incorrect:

```bash
export PLAYWRIGHT_SERVICE_URL = "wss://eastasia.api.playwright.microsoft.com/playwrightworkspaces/86bb2b02-c971-4550-879b-cb1e214766cc/browsers"
```

## 6. Run tests using Playwright Workspaces

Run:

```bash
npx playwright test -c playwright.service.config.ts --workers=1
```

Using `--workers=1` is a safe starting point for a free plan.

## 7. Open the HTML report

After the test run finishes, open the report with:

```bash
npx playwright show-report
```

## Azure DevOps pipeline template

This repo also includes an Azure DevOps pipeline file:

```bash
azure-pipline.yml
```

Full `azure-pipline.yml` template:

```yml
variables:
  PLAYWRIGHT_SERVICE_URL: "wss://eastasia.api.playwright.microsoft.com/playwrightworkspaces/86bb2b02-c971-4550-879b-cb1e214766cc/browsers"
  PLAYWRIGHT_WORKERS: "1"

steps:
  - task: PowerShell@2
    enabled: true
    displayName: "Install dependencies"
    inputs:
      targetType: "inline"
      script: "npm ci"
      workingDirectory: "$(System.DefaultWorkingDirectory)"

  - task: AzureCLI@2
    displayName: "Run Playwright Test"
    env:
      PLAYWRIGHT_SERVICE_URL: $(PLAYWRIGHT_SERVICE_URL)
      # PLAYWRIGHT_SERVICE_ACCESS_TOKEN: $(PLAYWRIGHT_SERVICE_ACCESS_TOKEN) # Not recommended, use Microsoft Entra ID authentication.
    inputs:
      azureSubscription: "My_Service_Connection" # Update to your Azure service connection name.
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

Before running this in Azure DevOps, replace:

```yml
azureSubscription: "My_Service_Connection"
```

with your real Azure DevOps service connection name.

## Common errors

### `zsh: command not found: az`

Azure CLI is not installed. Install it:

```bash
brew install azure-cli
```

### `Could not authenticate with the service`

Log in again:

```bash
az login
```

Then check the active subscription:

```bash
az account show --output table
```

Also confirm the terminal has the service URL:

```bash
echo $PLAYWRIGHT_SERVICE_URL
```

If it prints nothing, export the URL again.

### `PLAYWRIGHT_SERVICE_URL` is missing

Export it before running tests:

```bash
export PLAYWRIGHT_SERVICE_URL="wss://eastasia.api.playwright.microsoft.com/playwrightworkspaces/86bb2b02-c971-4550-879b-cb1e214766cc/browsers"
```

## Full local command sequence

```bash
az --version
az login
export PLAYWRIGHT_SERVICE_URL="wss://eastasia.api.playwright.microsoft.com/playwrightworkspaces/86bb2b02-c971-4550-879b-cb1e214766cc/browsers"
npx playwright test -c playwright.service.config.ts --workers=1
npx playwright show-report
```
