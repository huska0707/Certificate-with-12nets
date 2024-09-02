import { NextResponse } from "next/server"
import axios from 'axios'


interface ResponseData {
    certificate: string,
    newIssuingAddress: string,
    privateKey: string
}

export async function POST(req: Request) {

    try {
        const { certificate, newIssuingAddress, privateKey }: ResponseData = await req.json()

        const response = await axios.post('http://localhost:3002/issue', {
            certificates: [certificate],
            newIssuingAddress,
            privateKey
        })

        return NextResponse.json(response.data)
    } catch (error) {
        if (error) {
            // Handle validation errors
            return NextResponse.json(
                { error: error },
                { status: 400 }
            );
        } else {
            console.error(error);
            return NextResponse.json(
                { error: 'Failed!' },
                { status: 500 }
            );
        }
    }
}