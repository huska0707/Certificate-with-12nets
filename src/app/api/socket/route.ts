import { env } from '@/env.mjs'
import axios from 'axios'
import { NextResponse } from 'next/server'


export async function POST(req: Request) {
    const { schoolEmail, studentEmail, status } = await req.json()

    try {
        const result = await axios.post(`${env.NEXT_PUBLIC_SOCKET_SERVER_URL}/api`, {
            schoolEmail,
            studentEmail,
            status
        })
        console.log("result: ", result.data)

        return NextResponse.json(
            { data: result.data },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error: ", error)
        return NextResponse.json(
            { error: error },
            { status: 500 }
        )
    }
}