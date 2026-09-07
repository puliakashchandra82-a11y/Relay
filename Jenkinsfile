pipeline {
    agent any

    parameters {
        gitParameter(
            name 'VERSION_TAG',
            type 'PT_TAG',
            description 'Git tag to release',
            defaultValue 'main',
            sortMode 'DESCENDING_SMART',
            selectedValue 'TOP'
        )
        choice(
            name 'TARGET_SITE',
            choices ['Cloudflare', 'GitHub Pages'],
            description 'Where to deploy the frontend'
        )
        booleanParam(
            name 'DEPLOY_BACKEND',
            defaultValue true,
            description 'Also trigger a backend deploy on Render for this tag'
        )
    }

    environment {
        REPO_URL = 'httpsgithub.compuliakashchandra82-a11yRelay.git'
    }

    stages {
        stage('Checkout tag') {
            steps {
                checkout scmGit(
                    branches [[name refstags${params.VERSION_TAG}]],
                    userRemoteConfigs [[url ${REPO_URL}]]
                )
            }
        }

        stage('Build frontend') {
            steps {
                withCredentials([string(credentialsId 'relay-backend-url', variable 'BACKEND_URL')]) {
                    dir('frontend') {
                        sh '''
                            npm install
                            VITE_API_URL=$BACKEND_URL npm run build
                            cp distindex.html dist404.html
                        '''
                    }
                }
            }
        }

        stage('Deploy frontend Cloudflare') {
            when { expression { params.TARGET_SITE == 'Cloudflare' } }
            steps {
                withCredentials([string(credentialsId 'cloudflare-api-token', variable 'CLOUDFLARE_API_TOKEN'),
                                  string(credentialsId 'cloudflare-account-id', variable 'CLOUDFLARE_ACCOUNT_ID')]) {
                    dir('frontend') {
                        sh 'npx wrangler deploy'
                    }
                }
            }
        }

        stage('Deploy frontend GitHub Pages') {
            when { expression { params.TARGET_SITE == 'GitHub Pages' } }
            steps {
                withCredentials([usernamePassword(credentialsId 'github-credentials', usernameVariable 'GIT_USER', passwordVariable 'GIT_TOKEN')]) {
                    dir('frontenddist') {
                        sh '''
                            git init -q
                            git config user.email jenkins@relay.local
                            git config user.name Jenkins
                            git checkout -b gh-pages
                            git add -A
                            git commit -q -m Deploy ${VERSION_TAG}
                            git push -f https${GIT_USER}${GIT_TOKEN}@github.compuliakashchandra82-a11yRelay.git HEADgh-pages
                        '''
                    }
                }
            }
        }

        stage('Deploy backend Render') {
            when { expression { params.DEPLOY_BACKEND == true } }
            steps {
                withCredentials([string(credentialsId 'render-deploy-hook', variable 'RENDER_DEPLOY_HOOK')]) {
                    sh 'curl -s -X POST $RENDER_DEPLOY_HOOK'
                }
            }
        }
    }

    post {
        success {
            echo Released ${params.VERSION_TAG} - ${params.TARGET_SITE}${params.DEPLOY_BACKEND  ' + Render backend'  ''}
        }
    }
}