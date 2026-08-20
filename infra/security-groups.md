# EventHive AWS Security Groups

This document defines the exact security group rules required for the EventHive deployment on AWS.

## Security Group: eventhive-ec2-sg (EC2 Instance)

This security group is attached to the EC2 instance running the EventHive backend.

### Inbound Rules

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| SSH | TCP | 22 | YOUR_ADMIN_IP/32 | Administrative SSH access (restrict to your IP) |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP traffic (redirects to HTTPS) |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS traffic from internet |

### Outbound Rules

| Type | Protocol | Port | Destination | Description |
|------|----------|------|-------------|-------------|
| All Traffic | All | All | 0.0.0.0/0 | Allow all outbound traffic |

## Security Group: eventhive-rds-sg (RDS Instance)

This security group is attached to the RDS MySQL instance.

### Inbound Rules

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| MySQL/Aurora | TCP | 3306 | eventhive-ec2-sg | Allow MySQL access only from EC2 security group |

**Important**: Do NOT allow inbound MySQL from 0.0.0.0/0. The RDS instance must NOT be accessible from the internet directly.

### Outbound Rules

| Type | Protocol | Port | Destination | Description |
|------|----------|------|-------------|-------------|
| All Traffic | All | All | 0.0.0.0/0 | Allow all outbound traffic |

## Security Group: eventhive-alb-sg (Application Load Balancer - Optional)

If using an ALB for high availability:

### Inbound Rules

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS traffic |

### Outbound Rules

| Type | Protocol | Port | Destination | Description |
|------|----------|------|-------------|-------------|
| HTTP | TCP | 80 | eventhive-ec2-sg | Forward HTTP to EC2 instances |

## IAM Role: eventhive-ec2-role

Attach the following to the EC2 instance:

1. **IAM Policy**: `eventhive-s3-rds-policy` (see `iam-policy.json`)
2. **CloudWatch Agent Server Policy**: AWS managed policy for CloudWatch logs
3. **SSM Managed Instance Core**: For remote access via Session Manager (recommended over SSH)

## Network Architecture

```
                    Internet
                       |
                       v
                [ALB (Optional)]
                80/443 -> 5000
                       |
                       v
            [EC2 Security Group]
            - 22 (SSH) from admin IP
            - 80/443 from internet
                       |
                       v
            [EC2 Instance]
            - Node.js app on port 5000
            - PM2 process manager
                       |
                       v
            [RDS Security Group]
            - 3306 from EC2 SG only
                       |
                       v
            [RDS MySQL Instance]
            - eventhive_db
```

## Key Security Decisions

1. **SSH restricted to specific IP**: Never open port 22 to 0.0.0.0/0
2. **RDS not internet-accessible**: MySQL port 3306 only accepts traffic from the EC2 security group
3. **S3 bucket private**: No public access; objects served via application or presigned URLs
4. **Least privilege IAM**: EC2 role only has S3 Put/Get/Delete for the specific bucket and RDS connect access
5. **HTTPS enforced**: Use ALB or Nginx to terminate TLS and redirect HTTP to HTTPS
