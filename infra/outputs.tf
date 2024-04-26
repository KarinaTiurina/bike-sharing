output "zones_replicas" {
    value = [for zone in var.zones: zone if zone != var.zones.0]
}
