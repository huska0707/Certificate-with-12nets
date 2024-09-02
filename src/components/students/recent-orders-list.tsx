"use client"

import { useEffect, useState } from "react"
import { TableBody } from "../ui/table"
import { StudentOrderItem } from "./order-item"
import { Order } from "@prisma/client"
import { useSession } from "next-auth/react"
import { getOrdersByUserEmail } from "@/actions/orders"
import { io } from "socket.io-client"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from 'uuid'
import { env } from "@/env.mjs"

/**
 * This component is used to display the list of students' recent orders...
 * @returns JSX
 */
export function StudentRecentOrdersList(): JSX.Element {
    const session = useSession()
    const { toast } = useToast()

    // states...
    const [orders, setOrders] = useState<Order[] | null>(null)
    const [notification, setNotification] = useState<string | null>(null)

    useEffect(() => {
        async function getOrders() {
          try {
            if (session.data?.user.email) {
              const result = await getOrdersByUserEmail(session.data?.user.email)
              setOrders(result)
            }
          } catch (error) {
            console.error(error)
          }
        }
      
        if (session.data?.user.email) {
          void getOrders()
        }
      }, [session.data?.user.email, notification])

    useEffect(() => {
        if (session.data?.user.email) {
            const socket = io(`${env.NEXT_PUBLIC_SOCKET_SERVER_URL}/?email=${session.data.user.email}`)

            socket.on('connect', () => {
                console.log('Connected to Socket.IO server')
            })

            socket.on('notification', (data) => {
                console.log('Received notification: ', data)
                setNotification(uuidv4())
                toast({
                    title: "Transcript Order Status Updated!",
                    description: "Your transcript order status was updated!"
                })
            })

            socket.on('error', (error) => {
                console.error('Socket.IO error:', error)
            })

            return () => {
                socket.disconnect()
                console.log('Disconnected from Socket.IO server')
            }
        }
    }, [])

    return (
        <TableBody>
            {orders?.map((order) => (
                <StudentOrderItem key={order.id} order={order} />
            ))}
        </TableBody>
    )
}