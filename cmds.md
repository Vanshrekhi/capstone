kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.1/deploy/static/provider/cloud/deploy.yaml

kubectl create secret generic ai-secret --from-literal=MISTRAL_API_KEY=abc123xyz


<!-- kubectl create secret generic ai-secret --from-literal=GEMINI_API_KEY=AQ.Ab8RN6JXFsXGtwzGrU93me8TkYP5DJHXbiBS8KgxljNvdPSkwg -->


kubectl create secret generic ai-secret --from-literal=OPEN_ROUTER_API_KEY=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

& "C:\Tools\Skaffold\skaffold.exe" dev

& "C:\Tools\Skaffold\skaffold.exe" dev --cache-artifacts=false


docker build --no-cache -t sandbox:latest .