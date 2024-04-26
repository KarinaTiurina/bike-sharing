resource "google_cloud_run_v2_service" "admin_api" {
  name     = "admin-api"
  location = var.region

  template {
    timeout = "5s"

    containers {
      image = admin_api_gcr_uri
      ports {
        container_port = 443
      }
    }

    vpc_access {
      egress = "PRIVATE_RANGES_ONLY"

      network_interfaces {
        subnetwork = "default"
      }
    }
  }

  traffic {
    type = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent         = 100
  }
}

# TODO other apis

resource "google_cloud_run_v2_service" "management_fe" {
  name     = "management-fe"
  location = var.region

  template {
    timeout = "5s"

    containers {
      image = management_fe_gcr_uri
      ports {
        container_port = 443
      }
    }

    vpc_access {
      egress = "ALL_TRAFFIC"
      network_interfaces {
        subnetwork = "default"
      }
    }
  }

  traffic {
    type = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent         = 100
  }
}

# TODO: ^ IAM roles, one role for each api