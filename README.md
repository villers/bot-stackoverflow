# bot-stackoverflow

A Stackoverflow bot to improve your reputation.

# Configure secrets

rename .env.example to .env and fill the values.

# Test locally

```bash
npm install
npm run test
```

# Deploy

Configure file `terraform/variables.tf` with your Google project id.

Then you should package the code before deploy.

```bash
npm run build
```

Then you can deploy the code.

```bash
gcloud auth application-default login
cd terraform
terraform init
terraform deploy
```
