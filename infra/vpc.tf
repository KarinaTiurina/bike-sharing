resource "google_compute_network" "vpc_network" {
  name                    = "bike-network"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
}

resource "google_compute_subnetwork" "private_subnetwork" {
  name          = "private-subnetwork"
  ip_cidr_range = "10.37.0.0/16"
  region        = var.region
  network       = google_compute_network.vpc_network.id

  purpose    = "PRIVATE"
  stack_type = "IPV4_ONLY"
}

resource "google_compute_subnetwork" "public_subnetwork" {
  name          = "public-subnetwork"
  ip_cidr_range = "10.36.0.0/16"
  region        = var.region
  network       = google_compute_network.vpc_network.id

  purpose    = "REGIONAL_MANAGED_PROXY"
  stack_type = "IPV4_ONLY"
}

resource "google_certificate_manager_certificate" "web_certificate" {
  name     = "web-certificate"
  location = var.region
  scope    = "EDGE_CACHE"
  managed {
    domains = [
      google_certificate_manager_dns_authorization.customer_instance.domain,
    ]
    dns_authorizations = [
      google_certificate_manager_dns_authorization.customer_instance.id,
    ]
  }
}

resource "google_certificate_manager_dns_authorization" "customer_instance" {
  name   = "dns-auth"
  domain = "bikesharing.com"
}

# resource "google_network_security_gateway_security_policy" "default" {
#   name        = "my-policy-name"
#   location    = "us-central1"
# }

# resource "google_network_security_gateway_security_policy_rule" "default" {
#   name                    = "my-policyrule-name"
#   location                = "us-central1"
#   gateway_security_policy = google_network_security_gateway_security_policy.default.name
#   enabled                 = true  
#   priority                = 1
#   session_matcher         = "host() == 'example.com'"
#   basic_profile           = "ALLOW"
# }

# resource "google_network_services_gateway" "customer_gateway" {
#   name                                 = "customer-gateway"
#   location                             = var.region
#   addresses                            = ["10.128.0.99"]
#   type                                 = "SECURE_WEB_GATEWAY"
#   ports                                = [443]
#   scope                                = "my-default-scope1"
#   certificate_urls                     = [google_certificate_manager_certificate.web_certificate.id]
#   gateway_security_policy              = google_network_security_gateway_security_policy.default.id
#   network                              = google_compute_network.vpc_network.id
#   subnetwork                           = google_compute_subnetwork.public_subnetwork.id
#   delete_swg_autogen_router_on_destroy = true
#   depends_on                           = [google_compute_subnetwork.proxyonlysubnet]
# }

# resource "google_dns_managed_zone" "public_dns" {
#   name     = "public-dns"
#   dns_name = "bikesharing.com."
# }

# resource "google_dns_record_set" "customer_fe_dns_entry" {
#   name = google_dns_managed_zone.public_dns.dns_name
#   type = "A"
#   ttl  = 300

#   managed_zone = google_dns_managed_zone.public_dns.name

#   rrdatas = [google_compute_instance.frontend.network_interface[0].access_config[0].nat_ip]
# }