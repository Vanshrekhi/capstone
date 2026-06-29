import { k8sCoreV1Api } from "./config.js"

export async function createPod(sandboxId) {
    const podManifest = {
        metadata: {
            name: `sandbox-pod-${sandboxId}`,
            labels: {
                sandboxId: sandboxId
            }
        },
        spec: {
            volumes: [
                {
                    name: 'workspace-volume',
                    emptyDir: {}
                }
            ],
            initContainers: [
                {
                    name: 'init-container',
                    image: "template",
                    imagePullPolicy: "IfNotPresent",
                    command: ['sh', '-c', 'cp -r /workspace/. /seed/',
                    ],
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/seed'
                        }
                    ],
                }
            ],
            containers: [
                {
                    image: "template:latest",
                    imagePullPolicy: "IfNotPresent",
                    name: 'sandbox-container',
                    ports: [{ containerPort: 5173, name: "http" }],
                    resources: {
                        limits: { cpu: "300m", memory: "350Mi" },
                        requests: { cpu: "150m", memory: "200Mi" }
                    },
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/workspace'
                        }
                    ]
                },
                {
                    image: "agent:latest",
                    imagePullPolicy: "IfNotPresent",
                    name: 'agent-container',
                    ports: [{ containerPort: 5173, name: "http" }],
                    resources: {
                        limits: { cpu: "300m", memory: "350Mi" },
                        requests: { cpu: "150m", memory: "200Mi" }
                    },
                    volumeMounts: [
                        {
                            name: 'workspace-volume',
                            mountPath: '/workspace'
                        }
                    ]
                }
            ]
        }
    }

    const response = await k8sCoreV1Api.createNamespacedPod({
        namespace: 'default',
        body: podManifest
    })
       return response;
}

    export async function deletePod(sandboxId) {
    const response = await k8sCoreV1Api.deleteNamespacedPod({
        namespace: 'default',
        name: `sandbox-pod-${sandboxId}`
    }, {
        gracePeriodSeconds: 0,
    })

    return response;

 
}