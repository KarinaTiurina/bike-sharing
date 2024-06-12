# resource "google_cloud_run_v2_service" "admin_api" {
#   name     = "admin-api"
#   location = var.region

#   template {
#     timeout = "5s"

#     containers {
#       image = data.google_container_registry_image.admin_api_image.image_url
#       ports {
#         container_port = 443
#       }
#     }

#     vpc_access {
#       egress = "PRIVATE_RANGES_ONLY"

#       network_interfaces {
#         subnetwork = google_compute_subnetwork.private_subnetwork.id
#       }
#     }
#   }

#   traffic {
#     type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
#     percent = 100
#   }
# }

# resource "google_cloud_run_v2_service" "support_api" {
#   name     = "support-api"
#   location = var.region

#   template {
#     timeout = "5s"

#     containers {
#       image = data.google_container_registry_image.support_api_image.image_url
#       ports {
#         container_port = 443
#       }
#     }

#     vpc_access {
#       egress = "PRIVATE_RANGES_ONLY"

#       network_interfaces {
#         subnetwork = google_compute_subnetwork.private_subnetwork.id
#       }
#     }
#   }

#   traffic {
#     type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
#     percent = 100
#   }
# }

# resource "google_cloud_run_v2_service" "user_api" {
#   name     = "user-api"
#   location = var.region

#   template {
#     timeout = "5s"

#     containers {
#       image = data.google_container_registry_image.user_api_image.image_url
#       ports {
#         container_port = 443
#       }
#     }

#     vpc_access {
#       egress = "PRIVATE_RANGES_ONLY"

#       network_interfaces {
#         subnetwork = google_compute_subnetwork.private_subnetwork.id
#       }
#     }
#   }

#   traffic {
#     type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
#     percent = 100
#   }
# }

# # TODO other apis

# resource "google_cloud_run_v2_service" "management_fe" {
#   name     = "management-fe"
#   location = var.region

#   template {
#     timeout = "5s"

#     containers {
#       image = data.google_container_registry_image.management_fe_image.image_url
#       ports {
#         container_port = 443
#       }
#     }

#     vpc_access {
#       egress = "ALL_TRAFFIC"
#       network_interfaces {
#         subnetwork = google_compute_subnetwork.public_subnetwork.id
#       }
#     }
#   }

#   traffic {
#     type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
#     percent = 100
#   }
# }

resource "google_cloud_run_v2_service" "customer_fe" {
  name     = "customer-fe"
  location = var.region

  template {
    timeout = "60s"

    containers {
      image = "europe-central2-docker.pkg.dev/bikesharing-420214/bike-sharing/bs-frontend-amd64"
      ports {
        container_port = 3000
      }
      resources {
        limits = {
          cpu    = "2"
          memory = "4000Mi"
        }
      }
    }    

    # vpc_access {
    #   egress = "ALL_TRAFFIC"
    #   network_interfaces {
    #     subnetwork = google_compute_subnetwork.public_subnetwork.id
    #   }
    # }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location = var.region
  project = var.project
  service = "customer-fe"
  policy_data = data.google_iam_policy.noauth.policy_data

}

# TODO: ^ IAM roles, one role for each api
resource "google_cloud_run_v2_service" "bike_api" {
  name     = "bike-api"
  location = var.region

  template {
    timeout = "5s"

    containers {
      image = data.google_container_registry_image.bike_api_image.image_url
      ports {
        container_port = 443
      }
    }

    vpc_access {
      egress = "PRIVATE_RANGES_ONLY"

      network_interfaces {
        subnetwork = google_compute_subnetwork.private_subnetwork.id
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}
