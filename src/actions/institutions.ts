"use server"

import { prisma } from "@/config/db"
import type { Institution, InstitutionType } from "@prisma/client"

export async function getInstitutions(): Promise<Institution[]> {
    try {
        return await prisma.institution.findMany({ include: { users: true } })
    } catch (error) {
        console.error(error)
        throw new Error("Fetching institutions error")
    }
}

export async function getInstitutionByUserEmail(email: string | undefined): Promise<Institution | null> {
    if(email?.length === 0) {
        return null
    }
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            },
            include: {
                institution: true
            }
        })

        if (!user || !user.institution) {
            return null
        }

        return user.institution
    } catch (error) {
        console.error(error)
        throw Error("Fetching institutions error by user email.")
    }
}

export async function getInstitutionIdByUserId(userId: string | undefined): Promise<string> {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })

        if (!user) {
            return "error"
        }

        return String(user.institutionId)
    } catch (error) {
        console.error(error)
        throw Error("Fetching institution id error by user id")
    }
}

export async function getInstitutionById(id: string): Promise<Institution | null> {
    try {
        const institution = await prisma.institution.findUnique({
            where: {
                id: Number(id)
            }
        })

        if (!institution) return null

        return institution
    } catch (error) {
        console.error(error)
        throw Error("Fetching institution data with id was failed")
    }
}


export async function getInstitutionGenre(institutionId: number | null | undefined): Promise<InstitutionType | undefined> {
    try {
        if (institutionId) {
            const institution = await prisma.institution.findUnique({
                where: {
                    id: institutionId
                }
            })

            return institution?.genre
        }
    } catch (error) {
        console.error(error)
        throw new Error("Fetching institution genre failed.")
    }
}