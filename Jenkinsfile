pipeline {

    agent any

    environment {
        APP_DIR = '/home/ec2-user/fullstack-app'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '>>> STAGE 1: Pulling latest code from GitHub...'
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                echo '>>> STAGE 2: Building Docker images...'
                sh '''
                    cd /home/ec2-user/fullstack-app
                    docker compose build --no-cache
                '''
            }
        }

        stage('Test') {
            steps {
                echo '>>> STAGE 3: Running tests...'
                sh '''
                    cd /home/ec2-user/fullstack-app
                    docker compose run --rm backend npm test
                '''
            }
        }

        stage('Stop Old Containers') {
            steps {
                echo '>>> STAGE 4: Stopping old containers...'
                sh '''
                    cd /home/ec2-user/fullstack-app
                    docker compose down || true
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo '>>> STAGE 5: Deploying new containers...'
                sh '''
                    cd /home/ec2-user/fullstack-app
                    docker compose up -d
                '''
            }
        }

        stage('Verify') {
            steps {
                echo '>>> STAGE 6: Verifying deployment...'
                sh '''
                    echo "Waiting 10 seconds for containers to fully start..."
                    sleep 10
                    echo "Testing backend health endpoint:"
                    curl -f http://localhost:5000/api/health
                    echo ""
                    echo "All running containers:"
                    docker compose -f /home/ec2-user/fullstack-app/docker-compose.yml ps
                '''
            }
        }

    }

    post {
        success {
            echo '========================================'
            echo 'DEPLOYMENT SUCCEEDED - APP IS LIVE'
            echo '========================================'
        }
        failure {
            echo '========================================'
            echo 'DEPLOYMENT FAILED - READ LOGS ABOVE'
            echo '========================================'
        }
        always {
            sh 'docker system prune -f || true'
        }
    }
}
