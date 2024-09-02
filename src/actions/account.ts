"use server"

import { prisma } from "@/config/db"
import { env } from "@/env.mjs"
import { generateIssuerProfile, generateIssuerRevocationList } from "@/lib/certificate-template"
import {
    type InstitutionAccountFormInput,
    type IssuerProfileInput,
    type StudentAccountFormInput,
    institutionAccountFormSchema,
    studentAccountFormSchema
} from "@/validations/account"
import { Octokit } from "@octokit/core"

import { Role } from "@prisma/client"
import path from "path"

import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import { delay } from "@/lib/utils"




export async function submitStudentAccountForm(
    rawInput: StudentAccountFormInput
): Promise<"error" | "success"> {
    try {
        const validatedInput = studentAccountFormSchema.safeParse(rawInput)
        if (!validatedInput.success) return "error"

        const {
            name,
            surname,
            email,
            phone,
            address,
            institutionId,
            role,
            photo
        } = validatedInput.data

        const updatedUser = await prisma.user.update({
            where: {
                email
            },
            data: {
                name,
                surname,
                phone,
                address,
                institution: {
                    connect: {
                        id: Number(institutionId)
                    }
                },
                role,
                image: photo
            }
        })


        // Redux...
        

        return updatedUser ? "success" : "error"
    } catch (error) {
        console.error(error)
        throw new Error("Error submitting account form")
    }
}






export async function submitInstitutionAccountForm(
    rawInput: InstitutionAccountFormInput
): Promise<"error" | "success"> {
    try {
        const validatedInput = institutionAccountFormSchema.safeParse(rawInput)
        if (!validatedInput.success) return "error"

        const {
            name,
            email,
            phone,
            genre,
            location,
            logo,
            issuerUrl,
            revocationList
        } = validatedInput.data

        const createdInstitution = await prisma.institution.create({
            data: {
                name,
                location,
                email,
                logo,
                genre,
                issuerUrl,
                revocationList
            }
        })

        const updatedUser = await prisma.user.update({
            where: {
                email
            },
            data: {
                name,
                phone,
                address: location,
                institution: {
                    connect: {
                        id: Number(createdInstitution.id)
                    }
                },
                role: Role.INSTITUTION,
                image: logo

            }
        })

        return updatedUser ? "success" : "error"
    } catch (error) {
        console.error(error)
        throw new Error("Error submitting account form")
    }
}






/**
 * This function is used to create a new online issuer link.
 * Here, this function should be able to create 2 JSON files - profile, revocation
 * Here, Git gist raw content apis will be used.
 * @param data InstitutionAccountFormInput
 */
export async function createIssuerProfile(
    data: IssuerProfileInput
): Promise<string> {
    const octokit = new Octokit({
        auth: env.GITHUB_SECRET
    })
    try {
        const issuer = generateIssuerProfile(data)

        const result = await octokit.request('POST /gists', {
            files: {
                ["profile.json"]: {
                    content: JSON.stringify(issuer, null, 2)
                }
            },
            public: true
        })

        const rawFileUrl = result?.data?.files?.['profile.json']?.raw_url ?? ''

        return rawFileUrl
    } catch (error) {
        console.error(error)
        throw new Error("Error creating issuer profile")
    }
}







interface RevocationList {
    url: string,
    filePath: string
}
export async function createRevocationListUrl(
    issuerUrl: string,
    id: string
): Promise<RevocationList> {
    try {
        const fileName = uuidv4() + ".json"
        const filePath = path.join(process.cwd(), 'public', 'issuer_revocations', fileName)
        const url = `${env.NEXT_PUBLIC_APP_URL}/issuer_revocations/${fileName}`

        const revocationData = generateIssuerRevocationList(issuerUrl, id)

        // Create revocation...
        fs.writeFileSync(filePath, JSON.stringify(revocationData, null, 2))

        await delay(100);

        return {
            url,
            filePath
        }
    } catch (error) {
        console.error(error)
        throw new Error("Error creating issuer profile")
    }
}






export async function updateRevocationListUrl(filePath: string, issuerUrl: string, id: string) {
    await fs.promises.writeFile(filePath, JSON.stringify(generateIssuerRevocationList(issuerUrl, id), null, 2))
}








export async function saveIssuerProfileFile(
    data: IssuerProfileInput
) {
    try {
        const fileName = uuidv4() + ".json"
        const filePath = path.join(process.cwd(), 'public', 'issuer_profiles', fileName)

        const url = `${env.NEXT_PUBLIC_APP_URL}/issuer_profiles/${fileName}`

        const jsonData = generateIssuerProfile({
            ...data,
            profileUrl: url
        })

        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2))

        const { url: revocationUrl, filePath: revocationPath } = await createRevocationListUrl(url, "")

        // Update the profile data...
        fs.writeFileSync(filePath, JSON.stringify(generateIssuerProfile({ ...data, profileUrl: url, revocationList: revocationUrl }), null, 2))

        // Update revocation list with it's url...
        await updateRevocationListUrl(revocationPath, url, revocationUrl)

        return url

    } catch (error) {
        console.error('Error creating Gist created: ', error)
    }
}