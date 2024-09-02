"use server"

import { prisma } from "@/config/db";
import type { Order, OrderStatus } from "@prisma/client";


/**
 * This function is used to get orders by user email...
 * @param email 
 * @returns Promise<Order[] | null>
 */
export async function getOrdersByUserEmail(email: string): Promise<Order[] | null> {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (!user) return null

        const orders = await prisma.order.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        })

        return orders
    } catch (error) {
        console.error(error)
        return null
    }
}

/**
 * This function is used to get all of orders with institution id...
 * @param institutionId 
 * @returns Promise<Order[] | null>
 */
export async function getOrdersByInstitutionId(institutionId: string): Promise<Order[] | null> {
    try {
        const orders = await prisma.order.findMany({
            where: {
                institutionId: institutionId
            }
        })

        if (!orders) return null

        return orders
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) : Promise<"success" | "error"> {
    try {
        const updatedOrder = await prisma.order.update({
            where: {
                id: orderId
            },
            data: {
                status: status
            }
        })

        if(!updatedOrder) return "error"

        return "success"
    } catch (error) {
        console.error(error)
        throw new Error("Update order status was failed.")
    }
}


/**
 * This function is used to get order by order id...
 * @param orderId
 * @returns Promise<Order | null>
 */
export async function getOrderByOrderId(orderId: string): Promise<Order | null> {
    try {
        const order = await prisma.order.findUnique({
            where: {
                id: orderId
            }
        })

        if (!order) return null

        return order
    } catch (error) {
        console.error(error)
        return null
    }
}