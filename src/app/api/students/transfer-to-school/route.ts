import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { v4 as uuidv4 } from 'uuid'
import { TranscriptOrderInput } from "@/validations/transcript"
import { OrderStatus } from "@prisma/client"
import { saveTranscriptOrderToDB } from "@/actions/transcript"
import { getInstitutionById, getInstitutionByUserEmail, getInstitutionIdByUserId } from "@/actions/institutions"
import axios from "axios"
import { getUserById } from "@/actions/user"
import { env } from "@/env.mjs"
import path from "path"
import { S3Client, ListObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3"

const Bucket = env.AWS_S3_BUCKET
const s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY
    }
})

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()

        const userId = formData.get('userId') as string
        const institutionId = await getInstitutionIdByUserId(userId)

        const file = formData.get('transcript') as File
        const aimedInstitutionId = formData.get('aimedInstitutionId') as string

        const newFileName = `${uuidv4()}.pdf`
        const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
        const filePath = path.join(uploadDir, newFileName)

        // const Body = (await file.arrayBuffer()) as Buffer
        // const data = await s3.send(new PutObjectCommand({ Bucket, Key: newFileName, Body }))

        // console.log("File uploaded successfully! ", data)

        /**
         * Saving to database after uploading file..
         */
        const rawData: TranscriptOrderInput = {
            id: uuidv4(),
            userId,
            institutionId: institutionId,
            recipientUniversityId: aimedInstitutionId,
            file: filePath,
            status: OrderStatus.SUBMITTED
        }

        const response = await saveTranscriptOrderToDB(rawData)

        if (response === "error") {
            return NextResponse.json({ status: "fail" })
        }

        // Websocket update...
        const student = await getUserById({ id: rawData.userId })
        const school = await getInstitutionById(institutionId)

        const result = await axios.post(`${env.NEXT_PUBLIC_SOCKET_SERVER_URL}/api/order-create`, {
            schoolEmail: school?.email,
            studentEmail: student?.email
        })

        console.log(result.data)

        return NextResponse.json({
            status: "success", data: {
                file: file,
                id: aimedInstitutionId,
            }
        })
    }
    catch (e) {
        console.log(e)
        return NextResponse.json({ status: "fail", data: e })
    }
}
