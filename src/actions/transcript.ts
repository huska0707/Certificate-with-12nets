"use server"

import { prisma } from "@/config/db";
import {
    type TranscriptFormInput,
    type TranscriptOrderInput,
    transcriptFormSchema,
    transcriptOrderSchema
} from "@/validations/transcript";

/**
 * Ths function is used to submit transcript form...
 * @param rawInput 
 * @returns Promise<"error" | "success">
 */
export async function submitTranscriptForm(
    rawInput: TranscriptFormInput
): Promise<"error" | "success"> {
    try {
        const validatedInput = transcriptFormSchema.safeParse(rawInput)
        if (!validatedInput.success) return Promise.resolve("error")

        return Promise.resolve("success")
    } catch (error) {
        console.error(error)
        throw new Error("Error submitting account form")
    }
}


/**
 * This function is used to save student's transcript order to db...
 * @param data 
 * @returns Promise
 */
export async function saveTranscriptOrderToDB(
    data: TranscriptOrderInput
): Promise<"error" | "success"> {
    try {
        const validatedInput = transcriptOrderSchema.safeParse(data)
        if (!validatedInput.success) return "error"

        const {
            id,
            userId,
            institutionId,
            recipientUniversityId,
            file,
            status
        } = validatedInput.data

        const val = await prisma.order.create({
            data: {
                id,
                userId,
                institutionId,
                recipientUniversityId,
                file,
                status
            }
        })

        if (!val) {
            return "error"
        }

        return "success"
    } catch (error) {
        console.error(error)
        throw new Error("Failed saving transcript order to db.")
    }
}