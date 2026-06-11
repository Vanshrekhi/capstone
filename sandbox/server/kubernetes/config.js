import * as K8sApi from '@kubernetes/client-node'

const kc = new k8sApi.KubeConfig();
kc.loadFromDefault();

export const k8sCoreV1Api = kc.makeApiClient(K8sApi.CoreV1Api);

