# EventHive CloudWatch Setup Guide

This document describes how to set up CloudWatch monitoring for the EventHive EC2 instance.

## Prerequisites
- EC2 instance with IAM role attached (eventhive-ec2-role)
- CloudWatch agent installed on the instance
- Application logs being written to `/opt/eventhive/backend/logs/`

## Step 1: Install CloudWatch Agent

```bash
# Download and install the CloudWatch agent
sudo yum install -y amazon-cloudwatch-agent

# Or on Ubuntu/Debian:
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
```

## Step 2: Create CloudWatch Agent Config

Create `/opt/eventhive/backend/amazon-cloudwatch-agent.json`:

```json
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },
  "metrics": {
    "append_dimensions": {
      "InstanceId": "${aws:InstanceId}"
    },
    "metrics_collected": {
      "cpu": {
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_iowait",
          "cpu_usage_user",
          "cpu_usage_system"
        ]
      },
      "mem": {
        "measurement": [
          "mem_used_percent"
        ]
      },
      "disk": {
        "measurement": [
          "disk_used_percent"
        ]
      },
      "netstat": {
        "measurement": [
          "tcp_established"
        ]
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/opt/eventhive/backend/logs/combined.log",
            "log_group_name": "eventhive-backend",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/opt/eventhive/backend/logs/error.log",
            "log_group_name": "eventhive-backend-errors",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  }
}
```

## Step 3: Start the CloudWatch Agent

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/eventhive/backend/amazon-cloudwatch-agent.json \
  -s
```

## Step 4: Verify Setup

```bash
# Check agent status
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a status

# View logs in CloudWatch Console
# Go to CloudWatch > Log Groups > eventhive-backend
```

## Metrics to Monitor

- **CPU Utilization**: Should be below 70% for Free Tier t2.micro
- **Memory Usage**: Should be below 80%
- **Disk Usage**: Should be below 80%
- **TCP Connections**: Monitor for unusual spikes

## Alarms (Optional)

Create CloudWatch Alarms for:
- CPU utilization > 80% for 5 minutes
- Memory usage > 85% for 5 minutes
- 5xx errors from the health endpoint
