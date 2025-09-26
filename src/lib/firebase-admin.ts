import * as admin from "firebase-admin";
const serviceAccount = require("./firebase-config.json");

console.log("serviceAccount:", serviceAccount);
function getAdminDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: "studio-1412386785-35399",
      credential: admin.credential.cert({
        type: "service_account",
        project_id: "studio-1412386785-35399",
        private_key_id: "bfa50f59f806125b38d878e3f14e9fc320533134",
        private_key:
          "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDETPJP/S/roox3\nee0Tw5YFGZ5CtpOwKVxJJOkAvRhBWjyw3J9ZN2U/Fkxy2Ljs8CfeNfvUONZ7ElJ5\nrE3Qzh+OZig0pkyMoadFhqhiBHBRbsnj9Eu0LCmLAqT/re6Q6TxAm2zfWT7WOP/a\n6AtQpaBhmL02xzFcZ2PhZFvWPb/u4vRVDIzn6KU3525cg+2CA0siL/406Qty881H\n34BYdgOlBd7qPgJ86ukWezoJlOBciH6uLpr748Xf9C/CHKwquIyQ0AASf08vfyZe\nbxqrWC1/Qo3yfNRokoJEZNEk2/pbybCcqnuEg4e1WzavsErmwXrQSMQiG0vi249f\nbg0CzBO/AgMBAAECggEADnbQ//3a8xTmHsOYKXWm7zdFBwtm9HsHtsgGdyx3xhD9\nGdcX0r4XMr/U4D2B2suTVHdL2AZcH3NpKlf8397gSmDSo5aBW3dp2OCkNZy4Hff4\n3lgY3+zFHt4SBFjvlDPrYaNSMV7lF2nZyGqCsu2RVL+paYjh5TolDO2VKsMgCl0D\npSUFQWjbPC1IfPoXxEwHZKZKjdmNZim4QMVyXriyo5PCQ66pfgi7eCGbva4zdDqN\nbpllZwQZaQiRVH4jcjn2FHdDXe3TIa5/6l3B3zaCvVt4HUEptdTEYUqHqe/tOKqX\nUsFmD2lxFcXk2YEwIMIVZl8msqiwFxctK3CLAN1kOQKBgQDuK7h5ah945vrDVbzp\nspSFS8LEjewxgn9dElOD6fA9mOfcjKD4kZlNdUkPaWY8hqkYBxwKqkEs/awAYllk\n+qQFkFuwP9u13AjVbCYrjWferQiKz4Y8dn8MIzpDxIdLs3UiJVSSxgCVr2rQ+jmh\n9yqbmgzlGgifIXryMfFd5gOCSwKBgQDS/tRmRmGavZLhuN7U0e9mHPNj8wC1RPOK\novtOU/Wcrr17GyOTnDYe2B0FZS6G3hbe4NAV1j9H+p26lUf5FIt47kCvm3E7uyzc\niXFDrKEpdDkxKqKs/fqIu+qDzyZXJ5JRN7wTN7nJnanbYG24XZSH7aE6fTYZ0KGK\niZYAM2Yr3QKBgF8WW3c19Ey7wv/7mgmff4ZcQe1hUBxQInNRHsC6xGyDQIagKqAy\n2QbAvaOGjAe8J4RtSjfD03OX73TTzybunk+OW9zZEengaDJ1FCQtN3wCjzeENO6s\nzHpXEir+KpoBktFIICTdIlyghT/btujAGmW3MlDBfRGzNze80sWPUHVTAoGAIjUA\nOGiWsGClrIStU7GJb3OoHf8qkTjRhxtvRL6l5jYKMCgxN2AvAgclhVdnGKRu7slh\n0vh+H+xIoBRNq9sh1YRC5nV8ASQSXNrHiyI0qqTWFNuFrigq8voMRjxSSfT3asVv\nb2osa7xs6k0S3L4HM5ZZ+kKMf9jsJ6qwr+2lVd0CgYBgjs4SIU0M1+9IpLcmauz4\ncnepitX1h/mRTOz3mu0bqNpGkXkY4NXcQ7XTAoI/yCDDMtjy1TvB2YLg77Q7ZjZB\nlOB7dsmChLMyujfIoqCXzQedzr7mwd9fjcMob3tiqMt4hqpj2NgHURpPkbk1/knv\njffmhotWHRf8tbd6qeCtXw==\n-----END PRIVATE KEY-----\n",
        client_email:
          "firebase-adminsdk-fbsvc@studio-1412386785-35399.iam.gserviceaccount.com",
        client_id: "110850780468899321722",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url:
          "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40studio-1412386785-35399.iam.gserviceaccount.com",
        universe_domain: "googleapis.com",
      } as admin.ServiceAccount),
    });
  }
  return admin.firestore();
}

export { getAdminDb };
