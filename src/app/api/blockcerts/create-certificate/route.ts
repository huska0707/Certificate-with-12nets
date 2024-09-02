import { generateCertificateTemplate } from "@/lib/certificate-template"
import { type BlockcertsCertificate } from "@/types"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from 'uuid'

import * as didJWT from 'did-jwt';

interface JWTPayload {
  aud: string,
  iat?: number,
  name: string
}

export async function POST(req: Request) {
  const generateJWT = async (privateKey: string, walletAddress: string) => {
    const signer = didJWT.ES256KSigner(didJWT.hexToBytes(privateKey))
    const jwt = await didJWT.createJWT(
      { aud: `did:ethr:${walletAddress}`, iat: undefined, name: 'uPort Developer' } as JWTPayload,
      { issuer: `did:ethr:${walletAddress}`, signer },
      { alg: 'ES256K' }
    )

    return jwt
  }

  const generateCertificate = async (
    recipientData: any,
    transcriptData: any,
    issuerData: any,
    publicKey: string,
    privateKey: string,
    walletAddress: string
  ): Promise<BlockcertsCertificate> => {
    const jwt = await generateJWT(privateKey, walletAddress)
    const certificate: BlockcertsCertificate = generateCertificateTemplate(
      uuidv4(),
      issuerData,
      jwt,
      recipientData,
      transcriptData.transcript,
      publicKey,
      walletAddress
    )

    return certificate
  }

  try {
    const {
      recipientData,
      transcriptData,
      issuerData,
      publicKey,
      privateKey,
      address: walletAddress
    } = await req.json()

    const certificate: BlockcertsCertificate = await generateCertificate(recipientData, transcriptData, issuerData, publicKey, privateKey, walletAddress)

    return NextResponse.json(
      { certificate },
      { status: 200 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed!" },
      { status: 500 }
    )
  }
}