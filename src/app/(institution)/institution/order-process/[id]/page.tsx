"use client"

import { pdfToImg } from "@/lib/pdf-to-img"
import { useEffect, useState } from "react"
import { getBlockcertsPublicKeyId, getPublicKeyFromPrivateKey, handleDownloadJsonFile } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { OrderStatus, type Institution } from "@prisma/client"
import { useSession } from "next-auth/react"
import { useAccount } from "wagmi"
import { Input } from "@/components/ui/input"
import { type IssuerProfileInput } from "@/validations/account"
import { saveIssuerProfileFile } from "@/actions/account"
import { extractKeyInfo } from "@/lib/process-with-gpt"
import { io } from "socket.io-client"
import { getOrderByOrderId, updateOrderStatus } from "@/actions/orders"
import { env } from "@/env.mjs"
import { getUserById } from "@/actions/user"

enum Status {
    IDLE,
    UPLOADING,
    ANALYZING,
    SUCCESS,
    ERROR,
    PROCESSING
}

/**
 * This page is used to process orders from students...
 * The main point is to get recipient university information at first...
 * Also it is important to set issuer data to write on created certificate JSON file...
 * Transcript data is caught by OCR from uploaded transcript pdf file...
 * 
 * @returns JSX 
 */

interface TranscriptData {
    [key: string]: string
}

export default function Page({ params }: { params: { id: string } }): JSX.Element {
    /**
     * States...
     */
    const [pdfContent, setPdfContent] = useState<string[]>([])
    const [status, setStatus] = useState(Status.IDLE)
    const [pagesFinished, setPagesFinished] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const session = useSession()
    const [email, setEmail] = useState<string | null>(null)

    const [recipientData, setRecipientData] = useState<Institution | null>(null)
    const [issuerData, setIssuerData] = useState<string | null>(null)
    const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null)
    const [certificate, setCertificate] = useState(null)
    const [privateKey, setPrivateKey] = useState<string | null>(null)
    const [publicKey, setPublicKey] = useState<string | null>(null)
    const [showPrivateKeyDlg, setShowPrivateKeyDlg] = useState<boolean>(false)
    const [notifications, setNotifications] = useState([])
    const [values, setValues] = useState<IssuerProfileInput | null>(null)

    const { isConnected, address } = useAccount()
    const orderId = params.id


    /**
     * Life cycle
     */
    useEffect(() => {
        if (session.data?.user.email) {
            setEmail(session.data.user.email)
        }
    }, [session.data?.user.email])

    useEffect(() => {
        const socket = io(env.NEXT_PUBLIC_SOCKET_SERVER_URL, {
            query: {
                email: email
            }
        })

        return () => {
            socket.disconnect()
        }
    }, [])


    /**
     * This function is update students' orders' status in real time...
     * @param status 
     * @returns "success" | "error"
     */
    const updateStatus = async (status: OrderStatus): Promise<"success" | "error"> => {
        await updateOrderStatus(params.id, status)

        const order = await getOrderByOrderId(orderId)

        if (order) {
            const user = await getUserById({ id: order?.userId })

            await fetch('/api/socket', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    schoolEmail: email,
                    studentEmail: user?.email,
                    status: status
                })
            })

            return "success"
        } else {
            return "error"
        }
    }

    /**
     * Handling functionality to extract PDF file...
     * OCR will be used in this function to catch key information...
     * @param file 
     * @returns 
     */
    const handleExtractPDF = async (file: File) => {
        if (!file) return

        try {
            const images = await pdfToImg(file)
            setTotalPages(images.length)
            setStatus(Status.ANALYZING)

            const pages = []

            for (let i = 0; i < images.length; i++) {
                const image = images[i]
                const text = await runOCR(String(image))
                const textArray = text?.map((item: { Text: string }) => item.Text)
                pages.push(textArray?.join(" "))
                setPagesFinished(i + 1)
            }

            return pages
        } catch (error) {
            console.error("Error extracting PDF: ", error)
            setStatus(Status.ERROR)
        }
    }

    /**
     * How to use OCR in Next.JS typescript...
     * @param imageUrl 
     * @returns 
     */
    const runOCR = async (imageUrl: string) => {
        try {
            const response = await fetch("/api/textract", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ dataUrl: imageUrl })
            })

            const data = await response.json()
            return data?.Blocks.filter(
                (item: { BlockType: string }) => item.BlockType === "LINE"
            )
        } catch (error) {
            console.log("error", error)
        }
    }

    /**
     * Handling file uploads...
     * @param event 
     * @returns 
     */
    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = event.target.files
        if (!files) return

        const file = files[0]
        if (file) {
            if (!isConnected) {
                alert("You need to connect to wallet")
                return
            }

            if (!showPrivateKeyDlg) setShowPrivateKeyDlg(true)

            if (privateKey) {
                if (address) {
                    const publicKeyInJWK = getPublicKeyFromPrivateKey(privateKey)
                    const publicKeyId = getBlockcertsPublicKeyId(privateKey)

                    setPublicKey(publicKeyId)

                    if (email) {
                        const values: IssuerProfileInput = {
                            name: "",
                            email: email,
                            ethereumAddress: address,
                            createdDate: new Date().toISOString(),
                            profileUrl: "",
                            revocationList: "",
                            image: "",
                            publicJWK: publicKeyInJWK
                        }

                        const issuerProfileUrl = await saveIssuerProfileFile(values)

                        console.log("issuer profile url: ", issuerProfileUrl)

                        setIssuerData(issuerProfileUrl || "")
                    }


                    /**
                     * Calling socket server.
                     */
                    await updateStatus(OrderStatus.PENDING)
                }


                // setStatus(Status.UPLOADING)
                // const pdfContent = await handleExtractPDF(file)
                // const formattedPdfContent = pdfContent?.map(
                //     (item: string, index: number) => `Page ${index + 1}:\n${item}\n\n`
                // )

                // const data = await extractKeyInfo(formattedPdfContent)
                // const extractedData = data.choices[0].message.content

                // const startIndex = extractedData.indexOf("```json")
                // const endIndex = startIndex + "```json".length
                // const jsonPart = extractedData.slice(endIndex)

                // const lastIndex = jsonPart.lastIndexOf("```")
                // const result = jsonPart.slice(0, lastIndex)

                // if (result) {
                //     setTranscriptData(JSON.parse(result))
                // }

                // setTimeout(() => {
                //     setStatus(Status.SUCCESS)
                //     setPdfContent(formattedPdfContent!)
                // }, 1000)
            } else {
                alert("You need to enter the private key of your connected wallet! After submitting, the private key will be removed for your security!")
                return
            }
        }
    }

    /**
     * This function is used to handle generation of a certificate...
     */
    const handleGenerateCertificate = async () => {
        try {
            const response = await fetch('/api/blockcerts/create-certificate', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientData,
                    transcriptData,
                    issuerData,
                    publicKey,
                    privateKey,
                    address
                })
            })

            const data = await response.json()

            if (response.ok) {
                setCertificate(data.certificate)
                setStatus(Status.PROCESSING)

                handleDownloadJsonFile(data, "example-test-name")

                const res = await fetch('/api/blockcerts/issue-certificate', {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        certificate: data.certificate,
                        newIssuingAddress: address,
                        privateKey
                    })
                })

                const data_01 = await res.json()

                console.log("data1: ", data_01, data)
            } else {
                console.log("error")
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="flex min-h-screen flex-col w-full items-center justify-center">

            <h4 className="text-2xl font-semibold">
                Please upload Transcripts (PDF)
            </h4>
            {
                {
                    [Status.IDLE]: (
                        <div>
                            <Input type="text" placeholder="private key" onChange={e => setPrivateKey(e.target.value)} />
                            <br />
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="ml-28"
                            />
                        </div>
                    ),
                    [Status.UPLOADING]: <p>Uploading PDF...</p>,
                    [Status.ANALYZING]: (
                        <p className="text-center">
                            Analyzing PDF... <br />
                            {pagesFinished} of {totalPages} pages analyzed.
                        </p>
                    ),
                    [Status.SUCCESS]: (
                        <div>
                            <p>PDF successfully analyzed</p>
                            <Button onClick={handleGenerateCertificate}>Create Certificate</Button>
                        </div>
                    ),
                    [Status.ERROR]: <p>Error analyzing PDF.</p>,
                    [Status.PROCESSING]: (
                        <div>
                            <p>Successfully Created!</p>

                        </div>
                    )
                }[status]
            }

            {pdfContent &&
                pdfContent.map((page, index) => (
                    <div
                        key={index}
                        className="sm:w-[800px] w-full mt-6 bg-background border border-input rounded-md p-6"
                    >
                        <p className="text-lg font-medium mt-4">Page {index + 1}</p>
                        <p className="mt-4">{page}</p>
                    </div>
                ))}
        </div>
    )
}