import { BlockcertsCertificate, BlockcertsRevocationList } from "@/types"
import { IssuerProfileInput } from "@/validations/account"

/**
 * This function is used to create certificate templates...
 * @param id 
 * @param issuerData 
 * @param jwt 
 * @param recipientData 
 * @param transcript 
 * @param publicKey 
 * @returns 
 */
export function generateCertificateTemplate(
    id: string,
    issuerData: string,
    jwt: string,
    recipientData: string,
    transcript: string,
    publicKey: string,
    walletAddress: string
): BlockcertsCertificate {
    return {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://w3id.org/blockcerts/v3"
        ],
        "id": `urn:uuid:${id}`,
        "type": [
            "VerifiableCredential",
            "BlockcertsCredential"
        ],
        "issuer": issuerData,
        "issuanceDate": new Date().toISOString(),
        "nonce": "",
        "credentialSubject": {
            "id": jwt,
            "name": "Julien Fraichot",
            "email": "julien.fraichot@hyland.com",
            "publicKey": `ecdsa-koblitz-pubkey:${walletAddress}`,
            "claim": {
                "name": "Master of Puppets",
                "description": "Awarded to those who rock"
            }
        },
        "display": {
            "contentMediaType": "text/html",
            "content": "<html><body><h1>Some content</h1></body></html>"
        }
    }
}

/**
 * This function is used to create or update issuer profile.
 * 1. When registering, information that are related to blockcerts such as ethereumAddress, publicJWK and etc will be empty.
 * 2. When signing certificate, the issuer profile will be updated with the above information by calling this function again.
 * @param issuerData : IssuerProfileInput
 * @returns string (url of raw file link)
 */
export function generateIssuerProfile(issuerData: IssuerProfileInput) {
    const {
        ethereumAddress,
        createdDate,
        name,
        email,
        publicJWK,
        profileUrl,
        revocationList,
        image
    } = issuerData

    return {
        "@context": [
            "https://w3id.org/openbadges/v2",
            "https://w3id.org/blockcerts/v2"
        ],
        "id": profileUrl,
        "type": "Profile",
        "name": name,
        "url": "https://www.blockcerts.org",
        "email": email,
        "publicKey": [
            {
                "id": `ecdsa-koblitz-pubkey:${ethereumAddress}`,
                "created": createdDate
            }
        ],
        "verificationMethod": [
            {
                "id": `${profileUrl}#secp256k1-verification-public-key`,
                "type": "JsonWebKey2020",
                "controller": profileUrl,
                "publicKeyJwk": publicJWK
            }
        ],
        "assertionMethod": [
            `${profileUrl}#secp256k1-verification-public-key`
        ],
        "revocationList": revocationList,

        "image": image
    }
}


/**
 * This function is used to create revocation list...
 * @param issuerUrl 
 * @returns 
 */
export function generateIssuerRevocationList(issuerUrl: string, id: string): BlockcertsRevocationList {
    return {
        "@context": "https://w3id.org/openbadges/v2",
        "id": id,
        "type": "RevocationList",
        "issuer": issuerUrl,
        "revokedAssertions": []
    }
}