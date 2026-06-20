# Set up Azure DevOps pipeline from a GitHub repo

This guide explains how to connect a GitHub repo to Azure DevOps Pipelines and run Playwright tests with Azure Playwright Workspaces.

The final flow is:

```text
Push code to GitHub
  -> Azure DevOps pipeline starts automatically
  -> Azure DevOps authenticates to Azure
  -> Playwright tests run in Azure Playwright Workspaces
```

## 1. Prepare the GitHub repo

Push this project to GitHub first.

The pipeline YAML file must exist in the GitHub repo:

```text
azure-pipline.yml
```

This project currently uses `azure-pipline.yml`. The common file name is `azure-pipelines.yml`, but Azure DevOps can still use `azure-pipline.yml` if you select it manually.

The YAML should include a branch trigger:

```yml
trigger:
  branches:
    include:
      - main

pr:
  branches:
    include:
      - main
```

This tells Azure DevOps to run the pipeline when code is pushed to `main`, and when pull requests target `main`.

## 2. Create a pipeline in Azure DevOps

In Azure DevOps:

1. Open your Azure DevOps project.
2. Go to **Pipelines**.
3. Click **Create Pipeline**.
4. Choose **GitHub** as the source.
5. Sign in to GitHub if prompted.
6. Authorize Azure Pipelines to access GitHub.
7. Select the GitHub repo:

```text
licai-lin/playwright-test-automation
```

If Azure DevOps asks for GitHub authentication, approve the request. This creates a GitHub service connection in Azure DevOps so Azure Pipelines can read the repo and receive push events.

## 3. Select the existing YAML file

When Azure DevOps asks how to configure the pipeline, choose:

```text
Existing Azure Pipelines YAML file
```

Then select:

```text
Branch: main
Path: /azure-pipline.yml
```

Click **Continue**.

Azure DevOps shows the YAML review screen. Do not run yet if the Azure service connection has not been created.

## 4. Create an Azure Resource Manager service connection

The GitHub connection only lets Azure DevOps read your GitHub repo.

The Playwright pipeline also needs permission to access your Azure subscription and Playwright Workspace. For that, create an **Azure Resource Manager** service connection.

In Azure DevOps:

1. Go to **Project settings**.
2. Select **Service connections**.
3. Click **New service connection**.
4. Choose:

```text
Azure Resource Manager
```

5. Select the recommended automatic option:

```text
App registration (automatic)
```

6. For credential type, choose:

```text
Workload identity federation
```

7. For scope level, choose:

```text
Subscription
```

8. Select your Azure subscription:

```text
Azure subscription 1
```

9. Select the resource group that contains your Playwright Workspace.

10. Enter a service connection name, for example:

```text
playwright-demo-test-service-connection
```

11. To allow this pipeline to use the service connection without additional manual authorization, select:

```text
Grant access permission to all pipelines
```

12. Click **Save**.

Creating the service connection itself does not create a paid Azure resource. It only creates authentication/permission for Azure DevOps. Costs come from Azure resources you use, such as Playwright Workspace execution and storage.

## 5. Update the YAML service connection name

The YAML must use the exact service connection name.

In `azure-pipline.yml`, update:

```yml
azureSubscription: "My_Service_Connection"
```

to:

```yml
azureSubscription: "playwright-demo-test-service-connection"
```

If your service connection has a different name, use that exact name instead.

## 6. Confirm required pipeline variables

The pipeline uses these variables:

```yml
variables:
  PLAYWRIGHT_SERVICE_URL: "wss://eastasia.api.playwright.microsoft.com/playwrightworkspaces/86bb2b02-c971-4550-879b-cb1e214766cc/browsers"
  PLAYWRIGHT_WORKERS: "1"
  PLAYWRIGHT_USERNAME: "student"
  PLAYWRIGHT_PASSWORD: "Password123"
```

For this demo project, keeping these values in YAML is fine.

For real projects, store secrets such as passwords, tokens, and API keys in Azure DevOps:

```text
Pipelines -> Library -> Variable groups
```

or:

```text
Pipeline -> Edit -> Variables
```

Mark sensitive values as secret.

## 7. Save, commit, and push

Commit and push the YAML changes to GitHub:

```bash
git add azure-pipline.yml
git commit -m "Configure Azure DevOps Playwright pipeline"
git push
```

Because the YAML has a `main` branch trigger, pushing to GitHub should automatically start a new Azure DevOps pipeline run.

## 8. Run or rerun the pipeline

In Azure DevOps:

1. Go to **Pipelines**.
2. Open the pipeline.
3. Click **Run pipeline** to start manually, or push a new commit to GitHub to trigger it automatically.

If the run passes, you should see a green check mark and a published Playwright report artifact.

## Common issues

### Service connection not found

Error example:

```text
connectedServiceNameARM references service connection ... which could not be found
```

Fix:

- Create an Azure Resource Manager service connection.
- Make sure the YAML `azureSubscription` value exactly matches the service connection name.
- Authorize the service connection for the pipeline if Azure DevOps asks.

### GitHub repo does not trigger the pipeline

Check that:

- The pipeline source is the GitHub repo, not Azure Repos.
- Azure Pipelines was authorized in GitHub.
- The YAML has a `trigger` section for `main`.
- You pushed to the same branch listed in the trigger.

### Environment variable is undefined

The local `.env` file is ignored by Git and is not available in Azure DevOps automatically.

Define CI values in YAML or Azure DevOps variables, then pass them into the task:

```yml
env:
  PLAYWRIGHT_USERNAME: $(PLAYWRIGHT_USERNAME)
  PLAYWRIGHT_PASSWORD: $(PLAYWRIGHT_PASSWORD)
```

### Could not authenticate with the Playwright service

Check that:

- The Azure Resource Manager service connection is valid.
- `azureSubscription` uses the exact service connection name.
- The service connection has permission to the subscription or resource group.
- `addSpnToEnvironment` is set to `true`.
- `PLAYWRIGHT_SERVICE_URL` is the correct browser endpoint from the Playwright Workspace.
