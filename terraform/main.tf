module "project-services" {
  source  = "terraform-google-modules/project-factory/google//modules/project_services"
  version = "~> 14.1"

  project_id = var.project_name

  disable_services_on_destroy = false
  activate_apis = [
    "run.googleapis.com",
  ]
}

resource "google_storage_bucket" "bucket" {
  name                        = "${var.project_name}-bot-stackoverflow" # Every bucket name must be globally unique
  location                    = "EU"
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_object" "object" {
  name   = "bot-stackoverflow.zip"
  bucket = google_storage_bucket.bucket.name
  source = "../bot-stackoverflow.zip" # Add path to the zipped function source code
}

resource "google_cloudfunctions2_function" "function" {
  name        = "bot-stackoverflow"
  location    = var.region
  description = "this function is used to get stackoverflow questions and answers"

  build_config {
    runtime     = "nodejs18"
    entry_point = "botStackoverflow" # Set the entry point
    source {
      storage_source {
        bucket = google_storage_bucket.bucket.name
        object = google_storage_bucket_object.object.name
      }
    }
  }

  service_config {
    max_instance_count = 1
    available_memory   = "256M"
    timeout_seconds    = 60
  }

  depends_on = [
    module.project-services
  ]
}

output "function_uri" {
  value = google_cloudfunctions2_function.function.service_config[0].uri
}
