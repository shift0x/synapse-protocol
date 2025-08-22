import { OperationResult } from "../types";
import { db } from "./db";

export const updateDomainExpertEarnings = async(id: number, earnings: number) : Promise<OperationResult<void>> => {
    const { error : getTotalPaidError, data } = await db.from("experts").select("total_paid").eq("id", id)

    if(getTotalPaidError)
        return { error: getTotalPaidError.message }

    const currentTotalPaid = data[0].total_paid
    const newTotalPaid = currentTotalPaid + earnings;

    const { error } = await db
        .from("experts")
        .update({
            total_paid: newTotalPaid
        })
        .eq('id', id)

    return { error }
}