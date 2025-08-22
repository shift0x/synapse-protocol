import { OperationResult } from "../types";
import { db } from "./db";

export const updateAccessKeyStatus = async(id: number, active: boolean) : Promise<OperationResult<void>> => {
    const { error } = await db
        .from("access_keys")
        .update({
            is_active: active
        })
        .eq('id', id)

    return { error }
}