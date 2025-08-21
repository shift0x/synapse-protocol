import { db } from "./db"
import { OperationResult, AccessKey } from '../types'

export type getDomainExpertsResponse = {
    error? : string,
    data? : any[]
}

export const getAccessKeys = async (query: {
    id?: number,
    account?: string,
    key?: string
}) : Promise<OperationResult<AccessKey[]>> => {
    if(!query.account && !query.key && !query.id) {
        return {
            error: "invalid query"
        }
    }

    let filter = db
        .from("access_keys")
        .select("*")

    if(query.id){
        filter = filter.eq("id", query.id)

        const {error, data} = await filter;

        return {
            error,
            data: data != null ? data as AccessKey[] : []
        }
    }

    if(query.account)
        filter = filter.ilike("owner_address", query.account)

    if(query.key)
        filter = filter.eq("access_key", query.key)

    const {error, data} = await filter;

    if(error){
        return { error }
    } else if (!data){
        return { message: "no data returned", data: []}
    } else {
        return { data: data as AccessKey[] }
    }
}