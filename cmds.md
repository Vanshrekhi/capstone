kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.1/deploy/static/provider/cloud/deploy.yaml


kubectl create secret generic ai-secret --from-literal=MISTRAL_API_KEY=3siKDd0Ua4HLgAzu0aXycVJgiUeP4PHu


kubectl create secret generic database `
  --from-literal=AUTH="mongodb+srv://rekhivansh6_6:Vansh%40123@cluster0.f7gafhc.mongodb.net/auth" `
  --from-literal=SANDBOX="mongodb+srv://rekhivansh6_6:Vansh%40123@cluster0.f7gafhc.mongodb.net/sandbox" `
  --from-literal=AI="mongodb+srv://rekhivansh6_6:Vansh%40123@cluster0.f7gafhc.mongodb.net/ai"


kubectl create secret generic google `
    --from-literal=GOOGLE_CLIENT_ID="100279602149-9vir187pihd5dua1a0nra9iv946aoplm.apps.googleusercontent.com" `
    --from-literal=GOOGLE_CLIENT_SECRET="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"

kubectl create secret generic jwt `
    --from-literal=JWT_SECRET=81bb77a1c6c764d692bf41987e49fd963cb7bed9d63d2de72cc4185cd8f01e5bd9779cc14c8054cabaefa80a 







& "C:\Tools\Skaffold\skaffold.exe" dev --cache-artifacts=false


MONGO DB 
Username : rekhivansh6_6
Pass : Vansh@123

MONGODB_URI=mongodb+srv://rekhivansh6_6:Vansh@123@cluster0.f7gafhc.mongodb.net/


