# Fix Cloud Build Permissions

## Problem
Cloud Build service account doesn't have permission to push images to Google Container Registry (GCR).

Error: `Permission "artifactregistry.repositories.uploadArtifacts" denied`

## Solution

### Option 1: Grant Storage Admin Role (Recommended for GCR)

The Cloud Build service account needs permission to write to GCR. Grant it the Storage Admin role:

```bash
# Get your project number (you can find this in Google Cloud Console)
# Or run: gcloud projects describe tryandfit --format="value(projectNumber)"

# Grant Storage Admin role to Cloud Build service account
gcloud projects add-iam-policy-binding tryandfit \
  --member="serviceAccount:[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com" \
  --role="roles/storage.admin"

# Example (replace PROJECT_NUMBER with your actual project number):
# gcloud projects add-iam-policy-binding tryandfit \
#   --member="serviceAccount:123456789012@cloudbuild.gserviceaccount.com" \
#   --role="roles/storage.admin"
```

### Option 2: Use Artifact Registry (Modern Approach)

Instead of GCR, use Artifact Registry which is the recommended approach:

1. **Create an Artifact Registry repository:**
```bash
gcloud artifacts repositories create gcr-repo \
  --repository-format=docker \
  --location=us \
  --project=tryandfit
```

2. **Update your cloudbuild files** to use Artifact Registry:
   - Change `gcr.io/tryandfit/` to `us-docker.pkg.dev/tryandfit/gcr-repo/`

### Option 3: Grant Service Account User Role

If using a custom service account, grant it the necessary roles:

```bash
# Grant Artifact Registry Writer role
gcloud projects add-iam-policy-binding tryandfit \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@tryandfit.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Grant Storage Admin for GCR
gcloud projects add-iam-policy-binding tryandfit \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@tryandfit.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

## Quick Fix (Automated Script)

**Easiest solution:** Run the automated fix script:

```bash
./fix-deployment-permissions.sh
```

This script will automatically:
- Get your project number
- Grant Storage Admin role (for GCR)
- Grant Artifact Registry Writer role (for Artifact Registry)
- Grant Service Account User role
- Verify the permissions

## Manual Quick Fix Command

Alternatively, run this command manually:

```bash
gcloud projects add-iam-policy-binding tryandfit \
  --member="serviceAccount:$(gcloud projects describe tryandfit --format='value(projectNumber)')@cloudbuild.gserviceaccount.com" \
  --role="roles/storage.admin"
```

For Artifact Registry, also run:
```bash
gcloud projects add-iam-policy-binding tryandfit \
  --member="serviceAccount:$(gcloud projects describe tryandfit --format='value(projectNumber)')@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

## Find Your Project Number

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **tryandfit**
3. The project number is shown in the project info card
4. Or run: `gcloud projects list --filter="projectId:tryandfit"`

## Verify Permissions

After granting permissions, try deploying again:
```bash
./deploy-backend-new.sh
```


