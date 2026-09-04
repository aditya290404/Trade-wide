provider "aws" {
  region = "us-east-1"
}

# VPC and Subnet for standard deployment
resource "aws_default_vpc" "default" {}

resource "aws_security_group" "paper_trade_sg" {
  name        = "paper_trade_sg"
  description = "Allow HTTP, HTTPS, and SSH"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instance for Jenkins & Application Hosting
resource "aws_instance" "app_server" {
  ami           = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS (us-east-1)
  instance_type = "t3.medium" # Need at least t3.medium for K8s/Jenkins overhead
  key_name      = "paper-trade-key"
  security_groups = [aws_security_group.paper_trade_sg.name]

  tags = {
    Name = "PaperTrade-Prod-Server"
  }
}

# S3 Bucket for Daily CSV Portfolio Exports & DB Snapshots
resource "aws_s3_bucket" "paper_trade_backups" {
  bucket = "paper-trade-backups-bucket-${random_id.bucket_id.hex}"
}

resource "random_id" "bucket_id" {
  byte_length = 4
}

# IAM Role for EC2 to access S3 seamlessly
resource "aws_iam_role" "ec2_s3_role" {
  name = "paper-trade-ec2-s3-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_s3_attach" {
  role       = aws_iam_role.ec2_s3_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

output "instance_ip" {
  value = aws_instance.app_server.public_ip
}
