# # TODO: pubsub topic + dataflow job


# resource "google_bigtable_instance" "bigtable_real_time" {
#   count = var.db_deletion_protection ? 1 : 0
#   name = "bigtable-real-time"

#   # Main cluster with autoscaling.
#   cluster {
#     cluster_id   = "bigtable-cluster-main"
#     storage_type = "SSD"
#     zone         = var.zones.0

#     autoscaling_config {
#       min_nodes  = 1
#       max_nodes  = 3
#       cpu_target = 50
#     }
#   }

#   # Replica clusters with fixed number of nodes.
#   dynamic "cluster" {
#     for_each = toset([for zone in var.zones : zone if zone != var.zones.0])
#     iterator = replica_zone

#     content {
#       cluster_id   = "bigtable-r-${replica_zone.value}"
#       num_nodes    = 1
#       storage_type = "SSD"
#       zone         = replica_zone.value
#     }
#   }

#   deletion_protection = false

#   lifecycle {
#     prevent_destroy = false
#   }
# }

# resource "google_bigtable_instance" "bigtable_real_time_deletable" {
#   count = var.db_deletion_protection ? 0 : 1
#   name = "bigtable-real-time"

#   # Main cluster with autoscaling.
#   cluster {
#     cluster_id   = "bigtable-cluster-main"
#     storage_type = "SSD"
#     zone         = var.zones.0

#     autoscaling_config {
#       min_nodes  = 1
#       max_nodes  = 3
#       cpu_target = 50
#     }
#   }

#   # Replica clusters with fixed number of nodes.
#   dynamic "cluster" {
#     for_each = toset([for zone in var.zones : zone if zone != var.zones.0])
#     iterator = replica_zone

#     content {
#       cluster_id   = "bigtable-r-${replica_zone.value}"
#       num_nodes    = 1
#       storage_type = "SSD"
#       zone         = replica_zone.value
#     }
#   }

#   deletion_protection = false
# }


# resource "google_firestore_database" "firestore_db" {
#   name        = "firestore-db"
#   location_id = var.region
#   type        = "FIRESTORE_NATIVE"

#   # TODO: Possible change to PESSIMISTIC
#   concurrency_mode = "OPTIMISTIC"

#   app_engine_integration_mode = "DISABLED"
#   # point_in_time_recovery_enablement = "POINT_IN_TIME_RECOVERY_ENABLED"
#   delete_protection_state = "DELETE_PROTECTION_${var.db_deletion_protection ? "ENABLED" : "DISABLED"}"
#   deletion_policy         = "DELETE"
# }
